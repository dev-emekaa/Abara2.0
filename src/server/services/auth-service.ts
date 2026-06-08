import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { loginSchema, signupSchema } from "@/lib/schemas";
import { seedStarterDataForUser } from "@/server/seed-starter";
import { ok, fail, type ActionResult } from "@/server/result";

/**
 * Auth data layer — pure of cookies/next so it can be driven directly by
 * integration tests. The server actions wrap these and add the session cookie.
 */

const GENERIC_LOGIN_ERROR = "Email or password is incorrect.";

export async function registerUser(
  input: unknown,
): Promise<ActionResult<{ user: User }>> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid details.");
  }
  const { fullName, email, location, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return fail("An account with that email already exists.");
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { fullName: fullName.trim(), email: normalizedEmail, location: location.trim(), passwordHash },
    });
    // Every new account starts alive, not empty.
    await seedStarterDataForUser(user.id);
    return ok({ user });
  } catch {
    return fail("Could not create your account. Please try again.");
  }
}

export async function authenticateUser(
  input: unknown,
): Promise<ActionResult<{ user: User }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid details.");
  }
  const email = parsed.data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return fail(GENERIC_LOGIN_ERROR);

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return fail(GENERIC_LOGIN_ERROR);

  return ok({ user });
}
