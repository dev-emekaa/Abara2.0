import "server-only";
import nodemailer from "nodemailer";

/**
 * Email is the prototype delivery channel for nudges (WhatsApp is production,
 * out of scope). Provider is env-selected and ALWAYS degrades safely:
 *   - resend:  real send via Resend HTTP API (needs RESEND_API_KEY)
 *   - mailpit: local SMTP capture (Docker) — view at http://localhost:8026
 *   - console / anything unset: no-op that logs a preview
 * Never throws — a failed send must not break the request.
 */

type Provider = "resend" | "mailpit" | "console";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailResult {
  delivered: boolean;
  via: Provider;
}

function resolveProvider(): Provider {
  const p = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (p === "resend" && (process.env.RESEND_API_KEY?.length ?? 0) > 5) {
    return "resend";
  }
  if (p === "mailpit") return "mailpit";
  return "console";
}

function from(): string {
  return process.env.EMAIL_FROM?.trim() || "Abara <care@abara.health>";
}

export async function sendEmail(msg: EmailMessage): Promise<EmailResult> {
  const via = resolveProvider();
  try {
    if (via === "resend") {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: from(),
          to: msg.to,
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
        }),
      });
      return { delivered: res.ok, via };
    }

    if (via === "mailpit") {
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "localhost",
        port: Number(process.env.SMTP_PORT || 1026),
        secure: false,
      });
      await transport.sendMail({
        from: from(),
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      });
      return { delivered: true, via };
    }

    // console fallback
    console.info(
      `[email:preview] to=${msg.to} subject="${msg.subject}"\n${msg.text}`,
    );
    return { delivered: false, via };
  } catch (err) {
    console.warn(
      `[email] send failed via ${via}; continuing:`,
      err instanceof Error ? err.message : err,
    );
    return { delivered: false, via };
  }
}

/** Render a nudge as a simple, on-brand email. */
export function renderNudgeEmail(
  firstName: string,
  nudge: { title: string; body: string; deepLink: string },
): { subject: string; html: string; text: string } {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${base}${nudge.deepLink}`;
  return {
    subject: nudge.title,
    text: `Hi ${firstName},\n\n${nudge.body}\n\nOpen in Abara: ${link}\n\nYou're receiving this because you have an active care plan with Abara. Reply STOP to pause nudges.`,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#20312c">
      <p>Hi ${firstName},</p>
      <p style="line-height:1.6">${nudge.body}</p>
      <p><a href="${link}" style="display:inline-block;background:#1d5a4d;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Open in Abara</a></p>
      <p style="font-size:12px;color:#7c8a83">You're receiving this because you have an active care plan with Abara. Reply STOP to pause nudges.</p>
    </div>`,
  };
}
