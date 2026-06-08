"use client";

import { useState } from "react";
import { StreakCard } from "./streak-card";
import { CheckInPanel } from "./check-in-panel";
import { TimelineItem } from "./timeline-item";
import { Stagger } from "@/components/motion/reveal";
import { demoTimeline } from "@/lib/mock-data";
import type { TimelineEvent } from "@/lib/types";

/** Sort newest-first for display. */
function sortDesc(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

export function TimelineView() {
  const [events, setEvents] = useState<TimelineEvent[]>(() =>
    sortDesc(demoTimeline),
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <StreakCard compact />
        <CheckInPanel
          onLogged={(e) => setEvents((prev) => sortDesc([e, ...prev]))}
        />
      </div>

      <div className="rounded-[var(--radius-xl)] border border-border bg-card/60 p-5 shadow-soft md:p-7">
        <h2 className="mb-5 font-display text-xl text-ink">Your health story</h2>
        {events.length === 0 ? (
          <p className="text-sm text-ink-faint">
            Nothing here yet — your timeline fills as you use Abara.
          </p>
        ) : (
          <Stagger key={events.length}>
            {events.map((event, i) => (
              <TimelineItem
                key={event.id}
                event={event}
                last={i === events.length - 1}
              />
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
