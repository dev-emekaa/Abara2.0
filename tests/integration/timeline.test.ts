import { prisma } from "@/lib/prisma";
import { recordCheckIn } from "@/server/services/timeline-service";
import { createTestUser } from "../helpers/db";

describe("recordCheckIn", () => {
  it("starts a streak and logs a CHECKIN timeline event", async () => {
    const user = await createTestUser();

    const res = await recordCheckIn(user.id, { mood: "better" }, new Date("2026-06-08T09:00:00Z"));
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.count).toBe(1);

    const streak = await prisma.streak.findUnique({ where: { userId: user.id } });
    expect(streak?.count).toBe(1);

    const events = await prisma.timelineEvent.findMany({
      where: { userId: user.id, type: "CHECKIN" },
    });
    expect(events).toHaveLength(1);
  });

  it("increments the streak on a consecutive next-day check-in", async () => {
    const user = await createTestUser();
    await recordCheckIn(user.id, { mood: "same" }, new Date("2026-06-07T09:00:00Z"));
    const res = await recordCheckIn(user.id, { mood: "better" }, new Date("2026-06-08T09:00:00Z"));
    expect(res.ok && res.data.count).toBe(2);
  });

  it("does not double-count two check-ins on the same day", async () => {
    const user = await createTestUser();
    await recordCheckIn(user.id, { mood: "same" }, new Date("2026-06-08T08:00:00Z"));
    const res = await recordCheckIn(user.id, { mood: "better" }, new Date("2026-06-08T20:00:00Z"));
    expect(res.ok && res.data.count).toBe(1);
    if (res.ok) expect(res.data.changed).toBe(false);
  });

  it("resets the streak after a missed day", async () => {
    const user = await createTestUser();
    await recordCheckIn(user.id, { mood: "same" }, new Date("2026-06-04T09:00:00Z"));
    const res = await recordCheckIn(user.id, { mood: "better" }, new Date("2026-06-08T09:00:00Z"));
    expect(res.ok && res.data.count).toBe(1);
  });

  it("rejects an invalid mood", async () => {
    const user = await createTestUser();
    const res = await recordCheckIn(user.id, { mood: "ecstatic" });
    expect(res.ok).toBe(false);
  });
});
