"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { demoNudges } from "@/lib/mock-data";
import type { Nudge, NudgeStatus } from "@/lib/types";

interface NudgeState {
  nudges: Nudge[];
  markSeen: (id: string) => void;
  markActed: (id: string) => void;
  setStatus: (id: string, status: NudgeStatus) => void;
  reset: () => void;
}

/**
 * Global nudge inbox state for Phase 1. Status transitions
 * (PENDING -> SEEN -> ACTED) are driven here; Phase 5 maps these to the server
 * `Nudge.status` column via a server action.
 */
export const useNudgeStore = create<NudgeState>()(
  persist(
    (set) => ({
      nudges: demoNudges,
      markSeen: (id) =>
        set((s) => ({
          nudges: s.nudges.map((n) =>
            n.id === id && n.status === "PENDING" ? { ...n, status: "SEEN" } : n,
          ),
        })),
      markActed: (id) =>
        set((s) => ({
          nudges: s.nudges.map((n) =>
            n.id === id ? { ...n, status: "ACTED" } : n,
          ),
        })),
      setStatus: (id, status) =>
        set((s) => ({
          nudges: s.nudges.map((n) => (n.id === id ? { ...n, status } : n)),
        })),
      reset: () => set({ nudges: demoNudges }),
    }),
    { name: "abara-nudges" },
  ),
);
