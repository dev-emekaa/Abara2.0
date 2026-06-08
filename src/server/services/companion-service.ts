import type { CompanionThread } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { companionMessageSchema } from "@/lib/schemas";
import { detectEscalation } from "@/lib/escalation";
import { generateText } from "@/lib/gemini";
import {
  buildOpenerText,
  buildSystemPrompt,
  buildSessionSummary,
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
    hasConsult: !!consult,
  };
}

/** Create a new OPEN thread with a proactive AI opener. */
async function createThreadWithOpener(
  userId: string,
  now: Date,
): Promise<CompanionThread> {
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

/**
 * Return the user's most recent thread (open OR closed, so the UI can show a
 * closed/escalated state with a "start new check-in" action), creating a first
 * one if none exists.
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
  return createThreadWithOpener(userId, now);
}

/** Explicitly begin a fresh check-in (the "Start a new check-in" button). */
export async function createFreshThread(
  userId: string,
  now: Date = new Date(),
): Promise<CompanionThread> {
  return createThreadWithOpener(userId, now);
}

export interface IngestResult {
  threadId: string;
  content: string;
  plan: CompanionReplyPlan;
}

export async function addUserMessage(
  userId: string,
  input: unknown,
): Promise<ActionResult<IngestResult>> {
  const parsed = companionMessageSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Say something first.");
  }

  const thread = await getOrCreateThread(userId, parsed.data.threadId);
  if (thread.status === "CLOSED") {
    return fail("This check-in is closed. Start a new one to keep talking.");
  }

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

export async function addAiMessage(
  threadId: string,
  text: string,
  escalated: boolean,
) {
  return prisma.companionMessage.create({
    data: { threadId, role: "AI", content: text, escalated },
  });
}

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
  const history: GeminiTurn[] = messages
    .slice(0, -1)
    .map((m) => ({ role: m.role === "AI" ? "AI" : "USER", content: m.content }));
  return { systemPrompt: buildSystemPrompt(ctx), history };
}

function stripQuotes(s: string): string {
  return s.replace(/^["'\s]+|["'\s]+$/g, "");
}

export interface CloseResult {
  title: string;
  detail: string;
  alreadyClosed: boolean;
}

/**
 * Close a check-in: write a SAFE, non-diagnostic summary to the health timeline
 * and mark the thread CLOSED. Idempotent. Routine summaries may be lightly
 * polished by Gemini (with fallback); escalation summaries never are.
 */
export async function closeThread(
  userId: string,
  threadId: string,
  now: Date = new Date(),
): Promise<ActionResult<CloseResult>> {
  const thread = await prisma.companionThread.findFirst({
    where: { id: threadId, userId },
  });
  if (!thread) return fail("Check-in not found.");
  if (thread.status === "CLOSED") {
    return ok({
      title: "Companion check-in",
      detail: thread.summary ?? "",
      alreadyClosed: true,
    });
  }

  const messages = await prisma.companionMessage.findMany({
    where: { threadId, role: { in: ["USER", "AI"] } },
  });
  const userMessages = messages.filter((m) => m.role === "USER");
  const escalated = messages.some((m) => m.escalated);
  const reasons = escalated
    ? Array.from(
        new Set(
          userMessages.flatMap((m) => detectEscalation(m.content).matchedLabels),
        ),
      )
    : [];

  const summary = buildSessionSummary({
    userMessageCount: userMessages.length,
    escalated,
    reasons,
  });

  // Polish ONLY non-escalated wording; never send safety messages to the model.
  let detail = summary.detail;
  if (!escalated) {
    const polished = await generateText(
      `Rewrite this one sentence for a personal health-record note. Keep it factual and warm, under 25 words, with no medical advice and no diagnosis: "${summary.detail}"`,
    );
    if (polished) detail = stripQuotes(polished);
  }

  await prisma.companionThread.update({
    where: { id: threadId },
    data: { status: "CLOSED", escalated, summary: detail, closedAt: now },
  });
  await prisma.timelineEvent.create({
    data: {
      userId,
      type: "COMPANION",
      title: summary.title,
      detail,
      occurredAt: now,
    },
  });

  return ok({ title: summary.title, detail, alreadyClosed: false });
}
