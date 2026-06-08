"use client";

import Link from "next/link";
import { CalendarClock, Pill, CloudRain, ArrowRight, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { relativeFrom } from "@/lib/format";
import type { Nudge, NudgeKind, NudgeStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const KIND_META: Record<
  NudgeKind,
  { icon: LucideIcon; label: string; accent: string }
> = {
  FOLLOWUP: { icon: CalendarClock, label: "Follow-up", accent: "text-teal-700" },
  MEDICATION: { icon: Pill, label: "Medication", accent: "text-coral" },
  SEASONAL: { icon: CloudRain, label: "Seasonal", accent: "text-[#9a6510]" },
};

const STATUS_TONE: Record<NudgeStatus, "neutral" | "teal" | "coral"> = {
  PENDING: "coral",
  SEEN: "neutral",
  ACTED: "teal",
};

interface NudgeCardProps {
  nudge: Nudge;
  onOpen?: (id: string) => void;
}

export function NudgeCard({ nudge, onOpen }: NudgeCardProps) {
  const meta = KIND_META[nudge.kind];
  const Icon = meta.icon;

  return (
    <Link
      href={`/app/nudges/${nudge.id}`}
      onClick={() => onOpen?.(nudge.id)}
      className={cn(
        "group flex items-start gap-4 rounded-[var(--radius-lg)] border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift",
        nudge.status === "PENDING"
          ? "border-coral/40"
          : "border-border",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-cream-deep",
          meta.accent,
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold", meta.accent)}>
            {meta.label}
          </span>
          {nudge.status === "PENDING" && (
            <span className="h-1.5 w-1.5 rounded-full bg-coral" aria-label="new" />
          )}
          <span className="ml-auto text-xs text-ink-faint">
            {relativeFrom(nudge.createdAt, "2026-06-08T09:00:00.000Z")}
          </span>
        </div>
        <h3 className="mt-1 truncate text-[1.02rem] font-medium text-ink">
          {nudge.title}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
          {nudge.body}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <Badge tone={STATUS_TONE[nudge.status]}>{nudge.status}</Badge>
          <span className="flex items-center gap-1 text-sm font-medium text-primary transition-transform group-hover:translate-x-0.5">
            Open <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
