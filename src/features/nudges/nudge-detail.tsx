"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FadeUp } from "@/components/motion/reveal";
import { useNudgeStore } from "@/stores/nudge-store";
import { demoUser } from "@/lib/mock-data";

const KIND_LABEL = {
  FOLLOWUP: "Follow-up",
  MEDICATION: "Medication",
  SEASONAL: "Seasonal",
} as const;

export function NudgeDetail({ id }: { id: string }) {
  const nudge = useNudgeStore((s) => s.nudges.find((n) => n.id === id));
  const markSeen = useNudgeStore((s) => s.markSeen);
  const markActed = useNudgeStore((s) => s.markActed);

  useEffect(() => {
    if (nudge && nudge.status === "PENDING") markSeen(nudge.id);
  }, [nudge, markSeen]);

  if (!nudge) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-border-strong bg-card/50 p-10 text-center">
        <p className="font-medium text-ink">Nudge not found</p>
        <p className="mt-1 text-sm text-ink-faint">
          It may have been cleared already.
        </p>
        <Link
          href="/app/nudges"
          className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4" })}
        >
          Back to nudges
        </Link>
      </div>
    );
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
            <Badge tone={nudge.status === "ACTED" ? "teal" : "neutral"}>
              {nudge.status}
            </Badge>
          </div>
          <h1 className="font-display text-2xl text-ink">{nudge.title}</h1>
          <p className="leading-relaxed text-ink-soft">{nudge.body}</p>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href={nudge.deepLink}
              onClick={() => markActed(nudge.id)}
              className={buttonVariants({ size: "md" })}
            >
              Take me there <ArrowRight className="h-4 w-4" />
            </Link>
            {nudge.status !== "ACTED" && (
              <Button
                variant="outline"
                size="md"
                onClick={() => markActed(nudge.id)}
              >
                <Check className="h-4 w-4" /> Mark as done
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email preview — prototype delivery channel. Required even though
          sending is stubbed (WhatsApp is the production channel, out of scope). */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
          <Mail className="h-3.5 w-3.5" /> Email preview
        </p>
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-paper shadow-soft">
          <div className="border-b border-border bg-cream-deep/60 px-5 py-3 text-xs text-ink-faint">
            <p className="break-words">
              <span className="text-ink-soft">To:</span> {demoUser.email}
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
            <p className="text-sm leading-relaxed text-ink">
              Hi {demoUser.fullName.split(" ")[0]},
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
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
          In the prototype, email sending no-ops to this preview unless an email
          provider key is set.
        </p>
      </div>
    </FadeUp>
  );
}
