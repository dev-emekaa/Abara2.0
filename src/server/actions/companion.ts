"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import {
  closeThread,
  createFreshThread,
} from "@/server/services/companion-service";
import { fail, ok, type ActionResult } from "@/server/result";

export async function closeSessionAction(
  threadId: string,
): Promise<ActionResult<{ title: string; detail: string }>> {
  const user = await getCurrentUser();
  if (!user) return fail("You need to be signed in.");
  if (typeof threadId !== "string" || !threadId) {
    return fail("Invalid check-in.");
  }

  const res = await closeThread(user.id, threadId);
  if (!res.ok) return res;

  revalidatePath("/app/companion");
  revalidatePath("/app/timeline");
  revalidatePath("/app");
  return ok({ title: res.data.title, detail: res.data.detail });
}

export async function startSessionAction(): Promise<
  ActionResult<{ threadId: string }>
> {
  const user = await getCurrentUser();
  if (!user) return fail("You need to be signed in.");

  const thread = await createFreshThread(user.id);
  revalidatePath("/app/companion");
  return ok({ threadId: thread.id });
}
