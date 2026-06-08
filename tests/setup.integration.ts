import { prisma } from "@/lib/prisma";

/**
 * Reset the test database before every test so each runs in isolation and in
 * any order. TRUNCATE … CASCADE is fast and resets identities.
 */
const TABLES = [
  "Nudge",
  "CompanionMessage",
  "CompanionThread",
  "TimelineEvent",
  "Streak",
  "Consultation",
  "User",
];

beforeEach(async () => {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLES.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE`,
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});
