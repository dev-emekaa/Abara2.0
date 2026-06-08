import { prisma } from "@/lib/prisma";
import { checkInSchema } from "@/lib/schemas";
import { computeStreakUpdate } from "@/services/streak";
import { ok, fail, type ActionResult } from "@/server/result";

const MOOD_COPY: Record<string, { title: string; detail: string }> = {
  better: {
    title: "You checked in: feeling better",
    detail: "Feeling better today — recovery on track.",
  },
  same: {
    title: "You checked in: about the same",
    detail: "About the same — still a little tired.",
  },
  worse: {
    title: "You checked in: a bit worse",
    detail: "Feeling a bit worse — keeping an eye on it.",
  },
};

export interface CheckInResult {
  count: number;
  changed: boolean;
}

/**
 * Record a check-in: update the streak (pure rules) and drop a CHECKIN event on
 * the timeline. `now` is injectable for deterministic tests.
 */
export async function recordCheckIn(
  userId: string,
  input: unknown,
  now: Date = new Date(),
): Promise<ActionResult<CheckInResult>> {
  const parsed = checkInSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid check-in.");
  }
  const { mood } = parsed.data;

  const streak = await prisma.streak.findUnique({ where: { userId } });
  const update = computeStreakUpdate(
    { count: streak?.count ?? 0, lastCheckInDate: streak?.lastCheckInDate ?? null },
    now,
  );

  await prisma.streak.upsert({
    where: { userId },
    create: {
      userId,
      count: update.count,
      lastCheckInDate: update.lastCheckInDate,
    },
    update: { count: update.count, lastCheckInDate: update.lastCheckInDate },
  });

  const copy = MOOD_COPY[mood];
  await prisma.timelineEvent.create({
    data: {
      userId,
      type: "CHECKIN",
      title: copy.title,
      detail: copy.detail,
      occurredAt: now,
    },
  });

  return ok({ count: update.count, changed: update.changed });
}
