/**
 * Care Companion business logic — pure, no DB, no network.
 * The system prompt encodes the safety boundary in words; the deterministic
 * guardrail in `@/lib/escalation` enforces it in code. Both matter.
 */

import { detectEscalation, ESCALATION_MESSAGE } from "@/lib/escalation";

export interface CompanionContext {
  firstName: string;
  specialty: string;
  doctorName: string;
  daysSinceConsult: number;
  /** False for a brand-new user who has no consultation on record yet. */
  hasConsult: boolean;
}

/** The proactive opening check-in shown when a thread is first created. */
export function buildOpenerText(ctx: CompanionContext): string {
  if (!ctx.hasConsult) {
    return `Hi ${ctx.firstName} 👋 Welcome to Abara. I'm your care companion — I'll check in on how you're feeling between visits, and if anything ever sounds serious I'll help you reach a doctor. How are you doing today?`;
  }
  return `Hi ${ctx.firstName} 👋 It's been ${ctx.daysSinceConsult} days since your ${ctx.specialty.toLowerCase()} consult with ${ctx.doctorName}. I wanted to check in — how are you feeling today? No rush, just whatever's true.`;
}

/** Short on purpose — keeps Gemini free-tier token use low. */
export function buildSystemPrompt(ctx: CompanionContext): string {
  const intro = ctx.hasConsult
    ? `You are Abara's Care Companion, a warm, plain-spoken health check-in assistant for ${ctx.firstName}, who had a ${ctx.specialty} consultation with ${ctx.doctorName} ${ctx.daysSinceConsult} days ago, in Nigeria.`
    : `You are Abara's Care Companion, a warm, plain-spoken health check-in assistant for ${ctx.firstName}, a new user in Nigeria who has no consultation on record yet.`;
  return [
    intro,
    "Your job: gently ask how they're feeling and encourage good habits (rest, fluids, finishing any medication).",
    "Hard rules — never break these:",
    "- Never diagnose. Never prescribe or name medications/doses. Never reassure a worrying symptom away.",
    "- You are not a doctor and must say so if asked for a diagnosis.",
    "- If the person reports anything severe, worsening, or alarming, do not keep triaging — tell them to connect with a doctor now.",
    "Keep replies short (2-3 sentences), warm, and human. No medical jargon.",
  ].join("\n");
}

/**
 * Safe, non-diagnostic replies used when Gemini is unavailable (missing key,
 * rate-limited, or errored). Rotated by turn so it doesn't feel robotic. These
 * still respect the safety boundary.
 */
export const FALLBACK_REPLIES: readonly string[] = [
  "Thanks for letting me know — that really helps. A few days of feeling low after an illness is common while your body recovers. Are you still able to eat and drink okay?",
  "Good to hear. Keep finishing your full course even now that you feel better — that's what stops things coming back. Want me to log this check-in on your timeline?",
  "Glad you're resting. I'll check in again in a couple of days. If anything changes — especially if you feel worse — tell me right away and I'll bring in a doctor.",
  "I hear you. Keep being kind to yourself today. If a new symptom shows up or something worries you, say the word and I'll connect you with a doctor.",
];

export function pickFallbackReply(turnIndex: number): string {
  const i = Math.abs(turnIndex) % FALLBACK_REPLIES.length;
  return FALLBACK_REPLIES[i];
}

export interface SessionSummaryInput {
  userMessageCount: number;
  escalated: boolean;
  reasons: string[];
}

export interface SessionSummary {
  title: string;
  detail: string;
}

/**
 * Build a SAFE, non-diagnostic summary of a closed check-in for the health
 * timeline. It records WHAT HAPPENED, never what's wrong — no diagnosis, no
 * advice. Escalation summaries are fixed wording and must never be sent to an
 * LLM for "polish".
 */
export function buildSessionSummary(input: SessionSummaryInput): SessionSummary {
  if (input.escalated) {
    const flagged =
      input.reasons.length > 0
        ? ` (${input.reasons.join(", ").toLowerCase()})`
        : "";
    return {
      title: "Companion flagged a concern",
      detail: `During a check-in, your companion noticed something that needed a doctor's attention${flagged} and recommended connecting with a clinician.`,
    };
  }

  if (input.userMessageCount === 0) {
    return {
      title: "Check-in opened",
      detail: "You opened a check-in with your companion.",
    };
  }

  return {
    title: "Companion check-in",
    detail:
      "You checked in with your companion and talked through how your recovery is going.",
  };
}

export interface CompanionReplyPlan {
  escalated: boolean;
  reasons: string[];
  /** Present when escalated, or when we must use the offline fallback. */
  text?: string;
}

/**
 * Decide how to respond to a user message *before* involving the model:
 * if the guardrail trips, we short-circuit to the escalation message and never
 * call the AI. Otherwise the caller streams a model (or fallback) reply.
 */
export function planCompanionReply(message: string): CompanionReplyPlan {
  const verdict = detectEscalation(message);
  if (verdict.escalated) {
    return {
      escalated: true,
      reasons: verdict.matchedLabels,
      text: ESCALATION_MESSAGE,
    };
  }
  return { escalated: false, reasons: [] };
}
