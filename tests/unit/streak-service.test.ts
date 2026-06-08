import { computeStreakUpdate, dayDiff } from "@/services/streak";

const d = (s: string) => new Date(s);

describe("dayDiff", () => {
  it("counts whole UTC calendar days", () => {
    expect(dayDiff(d("2026-06-07T23:00:00Z"), d("2026-06-08T01:00:00Z"))).toBe(1);
    expect(dayDiff(d("2026-06-08T00:00:00Z"), d("2026-06-08T23:00:00Z"))).toBe(0);
  });
});

describe("computeStreakUpdate", () => {
  it("starts the streak on the first ever check-in", () => {
    const r = computeStreakUpdate({ count: 0, lastCheckInDate: null }, d("2026-06-08T09:00:00Z"));
    expect(r).toMatchObject({ count: 1, changed: true });
  });

  it("is a no-op for a second check-in the same day", () => {
    const r = computeStreakUpdate(
      { count: 4, lastCheckInDate: d("2026-06-08T08:00:00Z") },
      d("2026-06-08T20:00:00Z"),
    );
    expect(r.count).toBe(4);
    expect(r.changed).toBe(false);
  });

  it("increments on a consecutive next-day check-in", () => {
    const r = computeStreakUpdate(
      { count: 4, lastCheckInDate: d("2026-06-07T08:00:00Z") },
      d("2026-06-08T09:00:00Z"),
    );
    expect(r.count).toBe(5);
    expect(r.changed).toBe(true);
  });

  it("resets to 1 after missing a day or more", () => {
    const r = computeStreakUpdate(
      { count: 9, lastCheckInDate: d("2026-06-05T08:00:00Z") },
      d("2026-06-08T09:00:00Z"),
    );
    expect(r.count).toBe(1);
    expect(r.changed).toBe(true);
  });
});
