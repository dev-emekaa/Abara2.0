import { prisma } from "@/lib/prisma";
import {
  setNudgeStatus,
  generateNudgesForUser,
} from "@/server/services/nudge-service";
import { createTestUser } from "../helpers/db";

async function makeNudge(userId: string, status: "PENDING" | "SEEN" | "ACTED" = "PENDING") {
  return prisma.nudge.create({
    data: {
      userId,
      kind: "FOLLOWUP",
      title: "Time for a quick check-in",
      body: "...",
      deepLink: "/app/companion",
      status,
    },
  });
}

describe("setNudgeStatus", () => {
  it("transitions PENDING -> SEEN -> ACTED", async () => {
    const user = await createTestUser();
    const nudge = await makeNudge(user.id);

    const seen = await setNudgeStatus(user.id, { nudgeId: nudge.id, status: "SEEN" });
    expect(seen.ok && seen.data.status).toBe("SEEN");

    const acted = await setNudgeStatus(user.id, { nudgeId: nudge.id, status: "ACTED" });
    expect(acted.ok && acted.data.status).toBe("ACTED");
  });

  it("does not downgrade an ACTED nudge back to SEEN", async () => {
    const user = await createTestUser();
    const nudge = await makeNudge(user.id, "ACTED");
    const res = await setNudgeStatus(user.id, { nudgeId: nudge.id, status: "SEEN" });
    expect(res.ok && res.data.status).toBe("ACTED");
  });

  it("won't let a user touch another user's nudge", async () => {
    const owner = await createTestUser();
    const attacker = await createTestUser();
    const nudge = await makeNudge(owner.id);
    const res = await setNudgeStatus(attacker.id, { nudgeId: nudge.id, status: "SEEN" });
    expect(res.ok).toBe(false);
  });
});

describe("generateNudgesForUser", () => {
  it("creates nudges from the user's history", async () => {
    const user = await createTestUser({ location: "Enugu, Nigeria" });
    await prisma.consultation.create({
      data: {
        userId: user.id,
        doctorName: "Dr. Eze",
        specialty: "General Practice",
        summary: "malaria",
        createdAt: new Date("2026-06-04T09:00:00Z"),
      },
    });

    const res = await generateNudgesForUser(user.id, new Date("2026-06-08T09:00:00Z"));
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.created.length).toBeGreaterThan(0);
  });

  it("does not create duplicate nudges with the same title", async () => {
    const user = await createTestUser({ location: "Enugu, Nigeria" });
    await prisma.consultation.create({
      data: {
        userId: user.id,
        doctorName: "Dr. Eze",
        specialty: "General Practice",
        summary: "malaria",
        createdAt: new Date("2026-06-04T09:00:00Z"),
      },
    });
    const now = new Date("2026-06-08T09:00:00Z");

    const first = await generateNudgesForUser(user.id, now);
    const second = await generateNudgesForUser(user.id, now);

    expect(first.ok && first.data.created.length).toBeGreaterThan(0);
    expect(second.ok && second.data.created.length).toBe(0);
  });
});
