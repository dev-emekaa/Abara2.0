"use client";

import {
  Stethoscope,
  Pill,
  HeartPulse,
  Lightbulb,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import { Rise } from "@/components/motion/reveal";
import { formatDate, formatTime } from "@/lib/format";
import type { TimelineEvent, TimelineEventType } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_META: Record<
  TimelineEventType,
  { icon: LucideIcon; ring: string; chip: string; label: string }
> = {
  CONSULT: {
    icon: Stethoscope,
    ring: "bg-teal-700 text-primary-foreground",
    chip: "text-teal-800",
    label: "Consultation",
  },
  MEDICATION: {
    icon: Pill,
    ring: "bg-teal-500 text-white",
    chip: "text-teal-700",
    label: "Medication",
  },
  CHECKIN: {
    icon: HeartPulse,
    ring: "bg-coral text-white",
    chip: "text-coral",
    label: "Check-in",
  },
  TIP: {
    icon: Lightbulb,
    ring: "bg-amber text-white",
    chip: "text-[#9a6510]",
    label: "Tip",
  },
  FOLLOWUP: {
    icon: CalendarClock,
    ring: "bg-ink-soft text-white",
    chip: "text-ink-soft",
    label: "Follow-up",
  },
};

interface TimelineItemProps {
  event: TimelineEvent;
  /** Hide the connecting line on the last item. */
  last?: boolean;
}

export function TimelineItem({ event, last = false }: TimelineItemProps) {
  const meta = TYPE_META[event.type];
  const Icon = meta.icon;

  return (
    <Rise className="relative flex gap-4">
      {/* rail + node */}
      <div className="relative flex flex-col items-center">
        <span
          className={cn(
            "z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-soft",
            meta.ring,
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        {!last && (
          <span className="w-px flex-1 bg-gradient-to-b from-border-strong to-transparent" />
        )}
      </div>

      {/* content */}
      <div className={cn("min-w-0 pb-8", last && "pb-0")}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className={cn("text-xs font-semibold tracking-wide", meta.chip)}>
            {meta.label.toUpperCase()}
          </span>
          <span className="text-xs text-ink-faint">
            {formatDate(event.occurredAt)} · {formatTime(event.occurredAt)}
          </span>
        </div>
        <h3 className="mt-1 text-[1.02rem] font-medium leading-snug text-ink">
          {event.title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          {event.detail}
        </p>
      </div>
    </Rise>
  );
}
