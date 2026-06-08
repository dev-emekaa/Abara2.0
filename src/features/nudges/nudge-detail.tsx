"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FadeUp } from "@/components/motion/reveal";
import { setNudgeStatusAction } from "@/server/actions/nudges";
import type { Nudge } from "@/lib/types";

const KIND_LABEL = {
  FOLLOWUP: "Follow-up",
  MEDICATION: "Medication",
  SEASONAL: "Seasonal",
} as const;

interface NudgeDetailProps {
  nudge: Nudge;
  userName: string;
  userEmail: string;
}

export function NudgeDetail({ nudge, userName, userEmail }: NudgeDetailProps) {
  // Optimistically show SEEN immediately; persist it in the effect below.
  const [status, setStatus] = useState(
    nudge.status === "PENDING" ? "SEEN" : nudge.status,
  );
  const firstName = userName.split(" ")[0] || "there";

  // Persist "seen on first view" (no setState here — status already reflects it).
  useEffect(() => {
    if (nudge.status === "PENDING") {
      void setNudgeStatusAction({ nudgeId: nudge.id, status: "SEEN" });
    }
  }, [nudge.id, nudge.status]);

  function markActed() {
    setStatus("ACTED");
    void setNudgeStatusAction({ nudgeId: nudge.id, status: "ACTED" });
  }

  return (
    <FadeUp className="space-y-5">
      <Link
        href="/app/nudges"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> All nudges
      </Link>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="teal">{KIND_LABEL[nudge.kind]}</Badge>
            <Badge tone={status === "ACTED" ? "teal" : "neutral"}>{status}</Badge>
          </div>
          <h1 className="font-display text-2xl text-ink">{nudge.title}</h1>
          <p className="text-pretty leading-relaxed text-ink-soft">{nudge.body}</p>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href={nudge.deepLink}
              onClick={markActed}
              className={buttonVariants({ size: "md" })}
            >
              Take me there <ArrowRight className="h-4 w-4" />
            </Link>
            {status !== "ACTED" && (
              <Button variant="outline" size="md" onClick={markActed}>
                <Check className="h-4 w-4" /> Mark as done
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email preview — prototype delivery channel (sending is stubbed; WhatsApp
          is the production channel and is out of scope). */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
          <Mail className="h-3.5 w-3.5" /> Email preview
        </p>
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-paper shadow-soft">
          <div className="border-b border-border bg-cream-deep/60 px-5 py-3 text-xs text-ink-faint">
            <p className="break-words">
              <span className="text-ink-soft">To:</span> {userEmail}
            </p>
            <p className="break-words">
              <span className="text-ink-soft">From:</span> Abara
              &lt;care@abara.health&gt;
            </p>
            <p className="break-words">
              <span className="text-ink-soft">Subject:</span> {nudge.title}
            </p>
          </div>
          <div className="px-5 py-5">
            <p className="text-sm leading-relaxed text-ink">Hi {firstName},</p>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-soft">
              {nudge.body}
            </p>
            <span
              className={buttonVariants({
                size: "sm",
                className: "mt-4 pointer-events-none",
              })}
            >
              Open in Abara
            </span>
            <p className="mt-5 text-xs text-ink-faint">
              You&apos;re receiving this because you have an active care plan with
              Abara. Reply STOP to pause nudges.
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          Locally these are captured by Mailpit; in production they send via
          Resend. With no provider set, sending no-ops to this preview.
        </p>
      </div>
    </FadeUp>
  );
}
