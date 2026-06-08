"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { demoStreak } from "@/lib/mock-data";

interface StreakState {
  count: number;
  lastCheckInISO: string;
  /** Set when the most recent check-in incremented the streak (drives animation). */
  justIncremented: boolean;
  checkIn: () => void;
  clearJustIncremented: () => void;
  reset: () => void;
}

function todayKey(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Global care-streak state. In Phase 1 this is the source of truth for the
 * animated streak across Dashboard and Timeline; Phase 5 will reconcile it with
 * the server `Streak` row. Persisted to localStorage (non-sensitive).
 */
export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      count: demoStreak.count,
      lastCheckInISO: demoStreak.lastCheckInDate,
      justIncremented: false,
      checkIn: () => {
        const now = new Date().toISOString();
        const last = get().lastCheckInISO;
        // One increment per calendar day; a same-day check-in is a no-op.
        if (todayKey(last) === todayKey(now)) {
          return;
        }
        set((s) => ({
          count: s.count + 1,
          lastCheckInISO: now,
          justIncremented: true,
        }));
      },
      clearJustIncremented: () => set({ justIncremented: false }),
      reset: () =>
        set({
          count: demoStreak.count,
          lastCheckInISO: demoStreak.lastCheckInDate,
          justIncremented: false,
        }),
    }),
    { name: "abara-streak" },
  ),
);
