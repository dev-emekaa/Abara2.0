"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCardProps {
  count: number;
  /** When true, show the celebratory state (set briefly right after a check-in). */
  celebrate?: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * The care streak — the habit reward. The count gets a satisfying spring when it
 * changes (one of Abara's three high-impact motion moments). Count comes from
 * the server; the parent flips `celebrate` after a successful check-in.
 */
export function StreakCard({
  count,
  celebrate = false,
  className,
  compact = false,
}: StreakCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-gradient-to-br from-teal-900 to-teal-700 text-primary-foreground shadow-lift",
        compact ? "p-5" : "p-6",
        className,
      )}
    >
      <AnimatePresence>
        {celebrate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute right-5 top-5 text-coral-soft"
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        <motion.div
          key={count}
          initial={celebrate ? { scale: 0.4, rotate: -12 } : false}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 520, damping: 16 }}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-coral/90 shadow-glow-coral"
        >
          <Flame className="h-7 w-7 text-white" strokeWidth={2.2} />
        </motion.div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={count}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className="font-display text-4xl leading-none"
              >
                {count}
              </motion.span>
            </AnimatePresence>
            <span className="text-sm text-teal-100">
              day{count === 1 ? "" : ""} care streak
            </span>
          </div>
          <p className="mt-1 text-sm text-teal-100/90">
            {celebrate
              ? "Lovely — you showed up for yourself today."
              : "Small check-ins keep your recovery on track."}
          </p>
        </div>
      </div>
    </div>
  );
}
