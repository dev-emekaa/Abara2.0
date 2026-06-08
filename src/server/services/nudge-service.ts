import type { Nudge } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { nudgeStatusSchema } from "@/lib/schemas";
import { generateNudges } from "@/services/nudges";
import { ok, fail, type ActionResult } from "@/server/result";

/** Transition a nudge's status, scoped to its owner. */
export async function setNudgeStatus(
  userId: string,
  input: unknown,
): Promise<ActionResult<{ id: string; status: string }>> {
  const parsed = nudgeStatusSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid request.");
  }
  const { nudgeId, status } = parsed.data;

  const nudge = await prisma.nudge.findFirst({
    where: { id: nudgeId, userId },
  });
  if (!nudge) return fail("Nudge not found.");

  // Never downgrade an already-acted nudge back to seen.
  if (nudge.status === "ACTED" && status === "SEEN") {
    return ok({ id: nudge.id, status: nudge.status });
  }

  const updated = await prisma.nudge.update({
    where: { id: nudge.id },
    data: { status },
  });
  return ok({ id: updated.id, status: updated.status });
}

/**
 * Generate fresh nudges from the user's history and persist any that aren't
 * already present (dedupe by title among still-open nudges). Returns the
 * newly-created nudges.
 */
export async function generateNudgesForUser(
  userId: string,
  now: Date = new Date(),
): Promise<ActionResult<{ created: Nudge[] }>> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return fail("User not found.");

  const [consultations, timeline, openNudges] = await Promise.all([
    prisma.consultation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.timelineEvent.findMany({ where: { userId } }),
    prisma.nudge.findMany({ where: { userId, status: { not: "ACTED" } } }),
  ]);

  const existingTitles = new Set(openNudges.map((n) => n.title));
  const drafts = generateNudges({
    location: user.location,
    now,
    consultations: consultations.map((c) => ({
      specialty: c.specialty,
      summary: c.summary,
      createdAt: c.createdAt,
    })),
    timeline: timeline.map((t) => ({ type: t.type, occurredAt: t.occurredAt })),
  }).filter((d) => !existingTitles.has(d.title));

  const created: Nudge[] = [];
  for (const d of drafts) {
    created.push(
      await prisma.nudge.create({
        data: {
          userId,
          kind: d.kind,
          title: d.title,
          body: d.body,
          deepLink: d.deepLink,
        },
      }),
    );
  }

  return ok({ created });
}
