"use client";

import { useState } from "react";
import { StreakCard } from "./streak-card";
import { CheckInPanel } from "./check-in-panel";
import { TimelineItem } from "./timeline-item";
import { Stagger } from "@/components/motion/reveal";
import type { TimelineEvent } from "@/lib/types";

function sortDesc(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

interface TimelineViewProps {
  initialEvents: TimelineEvent[];
  initialStreak: number;
}

export function TimelineView({ initialEvents, initialStreak }: TimelineViewProps) {
  const [events, setEvents] = useState<TimelineEvent[]>(() =>
    sortDesc(initialEvents),
  );
  const [streak, setStreak] = useState(initialStreak);
  const [celebrate, setCelebrate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <StreakCard count={streak} celebrate={celebrate} compact />
        <CheckInPanel
          onChecked={(result, event) => {
            setEvents((prev) => sortDesc([event, ...prev]));
            if (result.changed) {
              setStreak(result.count);
              setCelebrate(true);
              setTimeout(() => setCelebrate(false), 1800);
            }
          }}
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
