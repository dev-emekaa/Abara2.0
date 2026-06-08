/**
 * Seed the demo account (Chidinma Okafor) so the app is demoable instantly.
 * Uses the SAME `seedStarterDataForUser` service that signup uses, so the demo
 * and a real new account get identical, alive starter data.
 *
 * Run: `pnpm db:seed`
 */
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { seedStarterDataForUser } from "@/server/seed-starter";

const DEMO = {
  email: "demo@abara.health",
  password: "demo1234",
  fullName: "Chidinma Okafor",
  location: "Enugu, Nigeria",
};

async function main() {
  // Idempotent: wipe and recreate the demo user (cascades remove their data).
  await prisma.user.deleteMany({ where: { email: DEMO.email } });

  const passwordHash = await hashPassword(DEMO.password);
  const user = await prisma.user.create({
    data: {
      email: DEMO.email,
      passwordHash,
      fullName: DEMO.fullName,
      location: DEMO.location,
    },
  });

  await seedStarterDataForUser(user.id);

  console.info(
    `✔ Seeded demo account: ${DEMO.email} / ${DEMO.password} (${user.id})`,
  );
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
