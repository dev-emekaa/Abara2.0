"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { recordCheckIn } from "@/server/services/timeline-service";
import { fail, type ActionResult } from "@/server/result";
import type { CheckInResult } from "@/server/services/timeline-service";

export async function checkInAction(
  input: unknown,
): Promise<ActionResult<CheckInResult>> {
  const user = await getCurrentUser();
  if (!user) return fail("You need to be signed in.");

  const res = await recordCheckIn(user.id, input);
  if (res.ok) {
    revalidatePath("/app/timeline");
    revalidatePath("/app");
  }
  return res;
}
