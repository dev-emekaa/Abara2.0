"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeartPulse, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkInAction } from "@/server/actions/timeline";
import type { TimelineEvent } from "@/lib/types";

const MOODS = [
  { key: "better", emoji: "🌤️", label: "Better", detail: "Feeling better today — recovery on track." },
  { key: "same", emoji: "😐", label: "About the same", detail: "About the same — still a little tired." },
  { key: "worse", emoji: "🌧️", label: "A bit worse", detail: "Feeling a bit worse — keeping an eye on it." },
] as const;

interface CheckInPanelProps {
  /** Bubbles up the new streak count + an optimistic timeline event. */
  onChecked: (result: { count: number; changed: boolean }, event: TimelineEvent) => void;
}

/**
 * "Log how I'm feeling" — the habit action. Persists via the check-in server
 * action; the streak update + new timeline event flow back to the parent.
 */
export function CheckInPanel({ onChecked }: CheckInPanelProps) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const counter = useRef(0);

  async function log(mood: (typeof MOODS)[number]) {
    setPending(true);
    setError(null);
    const res = await checkInAction({ mood: mood.key });
    setPending(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    counter.current += 1;
    onChecked(res.data, {
      id: `tl_checkin_${counter.current}`,
      userId: "self",
      type: "CHECKIN",
      title: `You checked in: ${mood.label.toLowerCase()}`,
      detail: mood.detail,
      occurredAt: new Date().toISOString(),
    });

    setDone(true);
    setTimeout(() => {
      setOpen(false);
      setDone(false);
    }, 1600);
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-coral/15 text-coral">
          <HeartPulse className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="font-medium text-ink">How are you feeling today?</p>
          <p className="text-sm text-ink-faint">
            A quick check-in keeps your streak alive.
          </p>
        </div>
        {!open && !done && (
          <Button variant="accent" size="sm" onClick={() => setOpen(true)}>
            Log it
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-danger">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-teal-700"
          >
            <Check className="h-4 w-4" /> Logged — nice one. See you tomorrow.
          </motion.div>
        ) : (
          open && (
            <motion.div
              key="picker"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-3 gap-2 overflow-hidden"
            >
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  disabled={pending}
                  onClick={() => log(m)}
                  className="flex flex-col items-center gap-1 rounded-[var(--radius-sm)] border border-border-strong bg-paper p-3 text-sm transition-all hover:-translate-y-0.5 hover:border-coral hover:shadow-soft disabled:opacity-60"
                >
                  {pending ? (
                    <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
                  ) : (
                    <span className="text-2xl">{m.emoji}</span>
                  )}
                  <span className="text-ink-soft">{m.label}</span>
                </button>
              ))}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
