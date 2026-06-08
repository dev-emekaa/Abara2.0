/** Small, dependency-free date helpers for display. */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** e.g. "2 Jun 2026" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** e.g. "08:15" */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Relative phrasing against a reference point ("4 days ago", "today").
 * `nowISO` is injectable so this stays deterministic in tests.
 */
export function relativeFrom(iso: string, nowISO?: string): string {
  const then = new Date(iso).getTime();
  const now = nowISO ? new Date(nowISO).getTime() : Date.now();
  const diffDays = Math.round((now - then) / 86_400_000);

  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.round(diffDays / 7)} wk ago`;
  if (diffDays < 365) return `${Math.round(diffDays / 30)} mo ago`;
  return `${Math.round(diffDays / 365)} yr ago`;
}
