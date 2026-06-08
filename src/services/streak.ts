/**
 * Care-streak rules — pure, no DB, no framework. The server action persists the
 * result; this module just decides what the new streak should be.
 *
 * Rules:
 *  - First ever check-in starts the streak at 1.
 *  - A second check-in on the SAME calendar day changes nothing.
 *  - A check-in the very next day increments the streak.
 *  - A gap of more than one day resets the streak to 1.
 *
 * Dates are compared in UTC for determinism (tests pass fixed instants).
 */

export interface StreakState {
  count: number;
  lastCheckInDate: Date | null;
}

export interface StreakUpdate {
  count: number;
  lastCheckInDate: Date;
  /** False when the check-in was a same-day no-op. */
  changed: boolean;
}

/** UTC calendar-day key, e.g. "2026-06-08". */
export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Whole calendar days from `a` to `b` (UTC), ignoring time of day. */
export function dayDiff(a: Date, b: Date): number {
  const ka = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const kb = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((kb - ka) / 86_400_000);
}

export function computeStreakUpdate(state: StreakState, now: Date): StreakUpdate {
  if (!state.lastCheckInDate) {
    return { count: 1, lastCheckInDate: now, changed: true };
  }

  const diff = dayDiff(state.lastCheckInDate, now);

  if (diff <= 0) {
    // Same day (or clock skew) — no change.
    return {
      count: state.count,
      lastCheckInDate: state.lastCheckInDate,
      changed: false,
    };
  }

  if (diff === 1) {
    return { count: state.count + 1, lastCheckInDate: now, changed: true };
  }

  // Missed a day or more — start over.
  return { count: 1, lastCheckInDate: now, changed: true };
}
