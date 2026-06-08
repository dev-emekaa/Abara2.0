import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { generateNudgesForUser } from "@/server/services/nudge-service";
import { sendEmail, renderNudgeEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Cron-style nudge generation. In production a scheduler would call this for due
 * users; here it generates fresh nudges for the signed-in user and (best-effort)
 * emails them via the configured provider (Mailpit locally, Resend in prod,
 * console no-op otherwise). Email failures never block the response.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(`nudges:${user.id}`, { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return Response.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const res = await generateNudgesForUser(user.id);
  if (!res.ok) {
    return Response.json({ error: res.error }, { status: 400 });
  }

  const firstName = user.fullName.split(" ")[0] || "there";
  const sendEmails = new URL(req.url).searchParams.get("email") === "true";

  let emailed = 0;
  if (sendEmails) {
    for (const nudge of res.data.created) {
      const mail = renderNudgeEmail(firstName, nudge);
      const r = await sendEmail({ to: user.email, ...mail });
      if (r.delivered) emailed += 1;
    }
  }

  return Response.json({ created: res.data.created.length, emailed });
}
