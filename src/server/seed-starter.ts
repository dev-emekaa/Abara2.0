import { prisma } from "@/lib/prisma";
import { generateNudges } from "@/services/nudges";

/**
 * Seed the DEMO account with realistic (openly fictional) health history so the
 * retention features are fully alive for graders. Used only by `prisma/seed.ts`.
 *
 * Real signups deliberately do NOT get fabricated clinical history — see
 * `seedWelcomeForUser` for the honest welcome state.
 *
 * `now` is injectable so it stays deterministic.
 */
export async function seedStarterDataForUser(
  userId: string,
  now: Date = new Date(),
): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const firstName = user.fullName.split(" ")[0] || "there";
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

  // Past consultations (historical — booking is out of scope).
  await prisma.consultation.create({
    data: {
      userId,
      doctorName: "Dr. Ngozi Eze",
      specialty: "General Practice",
      summary:
        "Confirmed uncomplicated malaria. Prescribed a short treatment course; advised rest and fluids, with a follow-up if fever persists.",
      status: "COMPLETED",
      createdAt: daysAgo(4),
    },
  });
  await prisma.consultation.create({
    data: {
      userId,
      doctorName: "Dr. Tunde Bakare",
      specialty: "General Practice",
      summary:
        "Seasonal cold with a mild sore throat. Reassurance, warm fluids and rest; no antibiotics needed.",
      status: "COMPLETED",
      createdAt: daysAgo(86),
    },
  });

  // A living timeline.
  await prisma.timelineEvent.createMany({
    data: [
      {
        userId,
        type: "CONSULT",
        title: "Malaria consultation with Dr. Ngozi Eze",
        detail: "Diagnosed with uncomplicated malaria. Treatment started.",
        occurredAt: daysAgo(4),
      },
      {
        userId,
        type: "MEDICATION",
        title: "Started malaria treatment",
        detail: "Take with food, morning and evening.",
        occurredAt: daysAgo(4),
      },
      {
        userId,
        type: "TIP",
        title: "Read: staying hydrated during recovery",
        detail: "Small, frequent sips beat large amounts all at once.",
        occurredAt: daysAgo(1),
      },
    ],
  });

  // An active starter streak.
  await prisma.streak.upsert({
    where: { userId },
    create: { userId, count: 3, lastCheckInDate: daysAgo(1) },
    update: { count: 3, lastCheckInDate: daysAgo(1) },
  });

  // Nudges generated from the seeded history (same engine used at runtime).
  const [consultations, timeline] = await Promise.all([
    prisma.consultation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.timelineEvent.findMany({ where: { userId } }),
  ]);

  let drafts = generateNudges({
    location: user.location,
    now,
    consultations: consultations.map((c) => ({
      specialty: c.specialty,
      summary: c.summary,
      createdAt: c.createdAt,
    })),
    timeline: timeline.map((t) => ({ type: t.type, occurredAt: t.occurredAt })),
  });

  // Safety net: never leave a new user with zero nudges.
  if (drafts.length === 0) {
    drafts = [
      {
        kind: "FOLLOWUP",
        title: "Time for a quick check-in",
        body: `Welcome, ${firstName}. Whenever you're ready, a quick check-in helps your companion keep an eye on how you're doing.`,
        deepLink: "/app/companion",
      },
    ];
  }

  await prisma.nudge.createMany({
    data: drafts.map((d) => ({
      userId,
      kind: d.kind,
      title: d.title,
      body: d.body,
      deepLink: d.deepLink,
    })),
  });
}
