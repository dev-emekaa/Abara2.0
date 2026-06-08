import { prisma } from "@/lib/prisma";
import { generateNudges } from "@/services/nudges";

/**
 * First-run state for a REAL new signup. Unlike the demo seed, this fabricates
 * NO clinical history — inventing consultations a user never had would be
 * dishonest and confusing. Instead it gives an honest, warm starting point:
 * a welcome timeline entry, a welcome nudge, and a genuine seasonal nudge if
 * their area applies. The streak starts at 0 (earned on the first real check-in)
 * and the companion greets them with a welcome opener.
 */
export async function seedWelcomeForUser(
  userId: string,
  now: Date = new Date(),
): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const firstName = user.fullName.split(" ")[0] || "there";

  await prisma.timelineEvent.create({
    data: {
      userId,
      type: "TIP",
      title: "Welcome to Abara 🌱",
      detail:
        "Your health story starts here. This timeline fills in as you check in, recover, and have consultations.",
      occurredAt: now,
    },
  });

  // An honest welcome nudge, plus a real seasonal one if their location applies.
  // generateNudges with no history yields only the seasonal nudge (or nothing).
  const seasonal = generateNudges({
    location: user.location,
    now,
    consultations: [],
    timeline: [],
  });

  const drafts = [
    {
      kind: "FOLLOWUP" as const,
      title: "Start with a quick check-in",
      body: `Welcome, ${firstName}. Whenever you're ready, tell your companion how you're feeling — it only takes a minute, and it starts your care streak.`,
      deepLink: "/app/companion",
    },
    ...seasonal,
  ];

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
