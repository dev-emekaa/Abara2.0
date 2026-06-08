"use client";

import { useState } from "react";
import { BellRing, Inbox } from "lucide-react";
import { NudgeCard } from "./nudge-card";
import { Badge } from "@/components/ui/badge";
import { Stagger, Rise } from "@/components/motion/reveal";
import { setNudgeStatusAction } from "@/server/actions/nudges";
import type { Nudge } from "@/lib/types";

export function NudgesInbox({ initialNudges }: { initialNudges: Nudge[] }) {
  const [nudges, setNudges] = useState<Nudge[]>(initialNudges);
  const pending = nudges.filter((n) => n.status === "PENDING").length;

  function markSeen(id: string) {
    setNudges((prev) =>
      prev.map((n) =>
        n.id === id && n.status === "PENDING" ? { ...n, status: "SEEN" } : n,
      ),
    );
    void setNudgeStatusAction({ nudgeId: id, status: "SEEN" });
  }

  if (nudges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-border-strong bg-card/50 p-12 text-center">
        <Inbox className="h-10 w-10 text-ink-faint" />
        <p className="mt-3 font-medium text-ink">Nothing needs you right now</p>
        <p className="text-pretty text-sm text-ink-faint">
          When something&apos;s worth your attention — a follow-up, a dose, a
          seasonal heads-up — it&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-ink-soft">
        <BellRing className="h-4 w-4 text-coral" />
        <span>
          {pending > 0
            ? `${pending} ${pending === 1 ? "nudge needs" : "nudges need"} a look`
            : "You're all caught up"}
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
