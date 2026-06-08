import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

let counter = 0;

/** Create a bare user directly (no seeding) for tests that don't need history. */
export async function createTestUser(
  over: Partial<Pick<User, "fullName" | "email" | "location">> = {},
): Promise<User> {
  counter += 1;
  return prisma.user.create({
    data: {
      fullName: over.fullName ?? "Test Person",
      email: over.email ?? `test${counter}@example.com`,
      location: over.location ?? "Enugu, Nigeria",
      passwordHash: "not-a-real-hash",
    },
  });
}
