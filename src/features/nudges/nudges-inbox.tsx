"use client";

import { BellRing, Inbox } from "lucide-react";
import { NudgeCard } from "./nudge-card";
import { Badge } from "@/components/ui/badge";
import { Stagger, Rise } from "@/components/motion/reveal";
import { useNudgeStore } from "@/stores/nudge-store";

export function NudgesInbox() {
  const nudges = useNudgeStore((s) => s.nudges);
  const markSeen = useNudgeStore((s) => s.markSeen);
  const pending = nudges.filter((n) => n.status === "PENDING").length;

  if (nudges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-border-strong bg-card/50 p-12 text-center">
        <Inbox className="h-10 w-10 text-ink-faint" />
        <p className="mt-3 font-medium text-ink">You&apos;re all caught up</p>
        <p className="text-sm text-ink-faint">
          New nudges will appear here as your care moves along.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-ink-soft">
        <BellRing className="h-4 w-4 text-coral" />
        <span>
          {pending > 0 ? `${pending} waiting for you` : "Nothing new right now"}
        </span>
        {pending > 0 && <Badge tone="coral">{pending} new</Badge>}
      </div>
      <Stagger className="space-y-3">
        {nudges.map((nudge) => (
          <Rise key={nudge.id}>
            <NudgeCard nudge={nudge} onOpen={markSeen} />
          </Rise>
        ))}
      </Stagger>
    </div>
  );
}
