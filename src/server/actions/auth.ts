"use server";

import {
  registerUser,
  authenticateUser,
} from "@/server/services/auth-service";
import { createSession, clearSession } from "@/lib/auth/session";
import { ok, type ActionResult } from "@/server/result";

export async function signupAction(
  input: unknown,
): Promise<ActionResult<{ userId: string }>> {
  const res = await registerUser(input);
  if (!res.ok) return res;
  await createSession({ sub: res.data.user.id, email: res.data.user.email });
  return ok({ userId: res.data.user.id });
}

export async function loginAction(
  input: unknown,
): Promise<ActionResult<{ userId: string }>> {
  const res = await authenticateUser(input);
  if (!res.ok) return res;
  await createSession({ sub: res.data.user.id, email: res.data.user.email });
  return ok({ userId: res.data.user.id });
}

export async function logoutAction(): Promise<void> {
  await clearSession();
}
