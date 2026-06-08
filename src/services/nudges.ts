/**
 * Smart nudge generation — pure rules, no DB. The server action feeds in the
 * user's own history and persists whatever drafts come back. Each draft deep-links
 * straight to the relevant in-app action.
 */

import type { NudgeKind } from "@/lib/types";

export interface NudgeContext {
  location: string;
  now: Date;
  /** Most-recent-first list of the user's consultations. */
  consultations: Array<{ specialty: string; summary: string; createdAt: Date }>;
  /** The user's timeline events (any order). */
  timeline: Array<{ type: string; occurredAt: Date }>;
}

export interface NudgeDraft {
  kind: NudgeKind;
  title: string;
  body: string;
  deepLink: string;
}

/** Areas where rainy-season malaria risk is worth a seasonal nudge. */
const MALARIA_PRONE_AREAS = [
  "enugu",
  "lagos",
  "ibadan",
  "abuja",
  "port harcourt",
  "kano",
  "benin",
  "owerri",
  "nigeria",
];

/** Nigerian rainy season runs roughly April–October (months are 0-indexed). */
function isRainySeason(now: Date): boolean {
  const m = now.getUTCMonth();
  return m >= 3 && m <= 9;
}

function daysSince(then: Date, now: Date): number {
  return Math.floor((now.getTime() - then.getTime()) / 86_400_000);
}

/**
 * Produce nudge drafts from the user's history. Returns an empty array when
 * nothing is currently worth surfacing — silence is a valid, intended outcome.
 */
export function generateNudges(ctx: NudgeContext): NudgeDraft[] {
  const drafts: NudgeDraft[] = [];

  // 1. FOLLOW-UP — a recent consultation with no check-in since.
  const lastConsult = ctx.consultations[0];
  if (lastConsult) {
    const age = daysSince(lastConsult.createdAt, ctx.now);
    const checkedInSince = ctx.timeline.some(
      (e) => e.type === "CHECKIN" && e.occurredAt > lastConsult.createdAt,
    );
    if (age >= 2 && age <= 10 && !checkedInSince) {
      drafts.push({
        kind: "FOLLOWUP",
        title: "Time for a quick check-in",
        body: `It's been ${age} days since your ${lastConsult.specialty.toLowerCase()} consultation. A two-minute check-in helps catch anything that isn't settling the way it should.`,
        deepLink: "/app/companion",
      });
    }
  }

  // 2. MEDICATION — a medication started recently; nudge to finish the course.
  const lastMed = ctx.timeline
    .filter((e) => e.type === "MEDICATION")
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())[0];
  if (lastMed) {
    const age = daysSince(lastMed.occurredAt, ctx.now);
    if (age >= 0 && age <= 5) {
      drafts.push({
        kind: "MEDICATION",
        title: "Finish your full course",
        body: "Keep taking your medication right to the end, even once you feel better — stopping early is the most common reason an illness comes back.",
        deepLink: "/app/timeline",
      });
    }
  }

  // 3. SEASONAL — rainy-season malaria risk in a known area.
  const loc = ctx.location.toLowerCase();
  if (isRainySeason(ctx.now) && MALARIA_PRONE_AREAS.some((a) => loc.includes(a))) {
    const area = ctx.location.split(",")[0].trim();
    drafts.push({
      kind: "SEASONAL",
      title: `Rainy season is here in ${area}`,
      body: "Mosquitoes are out in force around you right now. Two minutes on bed-net use could save you a round of malaria.",
      deepLink: "/app/timeline",
    });
  }

  return drafts;
}
