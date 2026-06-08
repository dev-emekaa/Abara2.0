"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import {
  setNudgeStatus,
  generateNudgesForUser,
} from "@/server/services/nudge-service";
import { fail, type ActionResult } from "@/server/result";

export async function setNudgeStatusAction(
  input: unknown,
): Promise<ActionResult<{ id: string; status: string }>> {
  const user = await getCurrentUser();
  if (!user) return fail("You need to be signed in.");

  const res = await setNudgeStatus(user.id, input);
  if (res.ok) {
    revalidatePath("/app/nudges");
    revalidatePath("/app");
  }
  return res;
}

export async function generateNudgesAction(): Promise<
  ActionResult<{ count: number }>
> {
  const user = await getCurrentUser();
  if (!user) return fail("You need to be signed in.");

  const res = await generateNudgesForUser(user.id);
  if (!res.ok) return res;
  revalidatePath("/app/nudges");
  return { ok: true, data: { count: res.data.created.length } };
}
