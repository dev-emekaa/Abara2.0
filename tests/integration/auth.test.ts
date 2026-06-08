import { prisma } from "@/lib/prisma";
import { registerUser, authenticateUser } from "@/server/services/auth-service";

const VALID = {
  fullName: "Ada Obi",
  email: "ada@example.com",
  location: "Lagos, Nigeria",
  password: "password123",
};

describe("registerUser", () => {
  it("creates a user, hashes the password, and seeds starter data", async () => {
    const res = await registerUser(VALID);
    expect(res.ok).toBe(true);

    const user = await prisma.user.findUnique({
      where: { email: "ada@example.com" },
    });
    expect(user).not.toBeNull();
    expect(user!.passwordHash).not.toBe(VALID.password);

    // Never an empty app: starter consultations + nudges exist.
    const consults = await prisma.consultation.count({ where: { userId: user!.id } });
    const nudges = await prisma.nudge.count({ where: { userId: user!.id } });
    const streak = await prisma.streak.findUnique({ where: { userId: user!.id } });
    expect(consults).toBeGreaterThan(0);
    expect(nudges).toBeGreaterThan(0);
    expect(streak?.count).toBeGreaterThan(0);
  });

  it("normalizes the email to lowercase", async () => {
    await registerUser({ ...VALID, email: "Ada@Example.com" });
    const user = await prisma.user.findUnique({
      where: { email: "ada@example.com" },
    });
    expect(user).not.toBeNull();
  });

  it("rejects a duplicate email", async () => {
    await registerUser(VALID);
    const res = await registerUser(VALID);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/already exists/i);
  });

  it("rejects a weak password", async () => {
    const res = await registerUser({ ...VALID, password: "short" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/8 characters/i);
  });

  it("rejects an invalid email", async () => {
    const res = await registerUser({ ...VALID, email: "not-an-email" });
    expect(res.ok).toBe(false);
  });
});

describe("authenticateUser", () => {
  beforeEach(async () => {
    await registerUser(VALID);
  });

  it("authenticates with correct credentials", async () => {
    const res = await authenticateUser({
      email: VALID.email,
      password: VALID.password,
    });
    expect(res.ok).toBe(true);
  });

  it("rejects a wrong password without leaking which field failed", async () => {
    const res = await authenticateUser({
      email: VALID.email,
      password: "wrongpassword",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/incorrect/i);
  });

  it("rejects an unknown email", async () => {
    const res = await authenticateUser({
      email: "nobody@example.com",
      password: VALID.password,
    });
    expect(res.ok).toBe(false);
  });
});
