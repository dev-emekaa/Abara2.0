"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { useStreakStore } from "@/stores/streak-store";
import { cn } from "@/lib/utils";

interface StreakCardProps {
  className?: string;
  /** Compact variant for tight spaces. */
  compact?: boolean;
}

/**
 * The care streak — the habit reward. The count increment gets a satisfying
 * spring (one of Abara's three high-impact motion moments). Reads global
 * streak state so Dashboard and Timeline stay in sync.
 */
export function StreakCard({ className, compact = false }: StreakCardProps) {
  const count = useStreakStore((s) => s.count);
  const justIncremented = useStreakStore((s) => s.justIncremented);
  const clear = useStreakStore((s) => s.clearJustIncremented);

  useEffect(() => {
    if (!justIncremented) return;
    const t = setTimeout(clear, 1600);
    return () => clearTimeout(t);
  }, [justIncremented, clear]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-gradient-to-br from-teal-900 to-teal-700 text-primary-foreground shadow-lift",
        compact ? "p-5" : "p-6",
        className,
      )}
    >
      {/* celebratory sparkle burst */}
      <AnimatePresence>
        {justIncremented && (
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
          initial={justIncremented ? { scale: 0.4, rotate: -12 } : false}
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
            <span className="text-sm text-teal-100">day care streak</span>
          </div>
          <p className="mt-1 text-sm text-teal-100/90">
            {justIncremented
              ? "Lovely — you showed up for yourself today."
              : "Small check-ins keep your recovery on track."}
          </p>
        </div>
      </div>
    </div>
  );
}
