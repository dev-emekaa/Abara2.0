import type { CompanionThread } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { companionMessageSchema } from "@/lib/schemas";
import {
  buildOpenerText,
  buildSystemPrompt,
  planCompanionReply,
  type CompanionContext,
  type CompanionReplyPlan,
} from "@/services/companion";
import type { GeminiTurn } from "@/lib/gemini";
import { fail, ok, type ActionResult } from "@/server/result";

function daysBetween(then: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / 86_400_000));
}

async function buildContext(
  userId: string,
  now: Date,
): Promise<CompanionContext> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const consult = await prisma.consultation.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return {
    firstName: user.fullName.split(" ")[0] || "there",
    specialty: consult?.specialty ?? "General Practice",
    doctorName: consult?.doctorName ?? "your doctor",
    daysSinceConsult: consult ? daysBetween(consult.createdAt, now) : 0,
  };
}

/**
 * Get the user's active companion thread, creating one (with a proactive AI
 * opener tied to their latest consultation) if none exists.
 */
export async function getOrCreateThread(
  userId: string,
  threadId?: string,
  now: Date = new Date(),
): Promise<CompanionThread> {
  if (threadId) {
    const existing = await prisma.companionThread.findFirst({
      where: { id: threadId, userId },
    });
    if (existing) return existing;
  }

  const latest = await prisma.companionThread.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (latest) return latest;

  const consult = await prisma.consultation.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  const thread = await prisma.companionThread.create({
    data: { userId, consultationId: consult?.id ?? null },
  });

  const ctx = await buildContext(userId, now);
  await prisma.companionMessage.create({
    data: {
      threadId: thread.id,
      role: "AI",
      content: buildOpenerText(ctx),
      escalated: false,
    },
  });

  return thread;
}

export interface IngestResult {
  threadId: string;
  content: string;
  plan: CompanionReplyPlan;
}

/**
 * Persist a user's message and run the deterministic safety guardrail.
 * Returns the guardrail plan: if escalated, the caller surfaces the escalation
 * reply and never calls the AI.
 */
export async function addUserMessage(
  userId: string,
  input: unknown,
): Promise<ActionResult<IngestResult>> {
  const parsed = companionMessageSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Say something first.");
  }

  const thread = await getOrCreateThread(userId, parsed.data.threadId);

  await prisma.companionMessage.create({
    data: {
      threadId: thread.id,
      role: "USER",
      content: parsed.data.content,
      escalated: false,
    },
  });

  const plan = planCompanionReply(parsed.data.content);
  return ok({ threadId: thread.id, content: parsed.data.content, plan });
}

/** Persist a companion (AI) reply. */
export async function addAiMessage(
  threadId: string,
  text: string,
  escalated: boolean,
) {
  return prisma.companionMessage.create({
    data: { threadId, role: "AI", content: text, escalated },
  });
}

/** Build the system prompt + prior turns for a Gemini call. */
export async function buildGeminiInputs(
  userId: string,
  threadId: string,
  now: Date = new Date(),
): Promise<{ systemPrompt: string; history: GeminiTurn[] }> {
  const ctx = await buildContext(userId, now);
  const messages = await prisma.companionMessage.findMany({
    where: { threadId, role: { in: ["USER", "AI"] } },
    orderBy: { createdAt: "asc" },
  });
  // Drop the just-added latest USER message — it's sent as the prompt itself.
  const history: GeminiTurn[] = messages
    .slice(0, -1)
    .map((m) => ({ role: m.role === "AI" ? "AI" : "USER", content: m.content }));
  return { systemPrompt: buildSystemPrompt(ctx), history };
}
