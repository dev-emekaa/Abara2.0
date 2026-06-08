import { useStreakStore } from "@/stores/streak-store";

describe("streak store", () => {
  beforeEach(() => {
    localStorage.clear();
    useStreakStore.getState().reset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts from the seeded demo streak", () => {
    expect(useStreakStore.getState().count).toBe(4);
  });

  it("increments the count on a new-day check-in and flags the animation", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-08T08:00:00.000Z"));

    useStreakStore.getState().checkIn();

    expect(useStreakStore.getState().count).toBe(5);
    expect(useStreakStore.getState().justIncremented).toBe(true);
  });

  it("is a no-op when checking in twice on the same day", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-07T10:00:00.000Z")); // same calendar day as seed

    useStreakStore.getState().checkIn();

    expect(useStreakStore.getState().count).toBe(4);
    expect(useStreakStore.getState().justIncremented).toBe(false);
  });

  it("clears the just-incremented flag", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-08T08:00:00.000Z"));
    useStreakStore.getState().checkIn();

    useStreakStore.getState().clearJustIncremented();

    expect(useStreakStore.getState().justIncremented).toBe(false);
  });
});
