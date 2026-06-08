import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  addUserMessage,
  addAiMessage,
  buildGeminiInputs,
} from "@/server/services/companion-service";
import { streamGeminiReply } from "@/lib/gemini";
import { pickFallbackReply } from "@/services/companion";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Split text into word-ish chunks so canned replies still "stream" smoothly. */
function chunkText(text: string): string[] {
  return text.split(/(\s+)/).filter((s) => s.length > 0);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => null);
  const ingest = await addUserMessage(user.id, body);
  if (!ingest.ok) {
    return new Response(JSON.stringify({ error: ingest.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { threadId, content, plan } = ingest.data;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      try {
        // SAFETY: guardrail short-circuits before any AI call.
        if (plan.escalated && plan.text) {
          await addAiMessage(threadId, plan.text, true);
          send({ type: "escalate", reasons: plan.reasons });
          for (const tok of chunkText(plan.text)) {
            send({ type: "token", value: tok });
          }
          send({ type: "done", escalated: true });
          controller.close();
          return;
        }

        // Normal reply: stream Gemini, fall back gracefully on any failure.
        let full = "";
        try {
          const { systemPrompt, history } = await buildGeminiInputs(
            user.id,
            threadId,
          );
          for await (const tok of streamGeminiReply({
            systemPrompt,
            history,
            message: content,
          })) {
            full += tok;
            send({ type: "token", value: tok });
          }
        } catch {
          const aiCount = await prisma.companionMessage.count({
            where: { threadId, role: "AI" },
          });
          full = pickFallbackReply(aiCount);
          for (const tok of chunkText(full)) {
            send({ type: "token", value: tok });
          }
        }

        if (!full.trim()) {
          full = pickFallbackReply(0);
          for (const tok of chunkText(full)) {
            send({ type: "token", value: tok });
          }
        }

        await addAiMessage(threadId, full, false);
        send({ type: "done", escalated: false });
        controller.close();
      } catch {
        send({ type: "error" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
