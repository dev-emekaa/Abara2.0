import { useNudgeStore } from "@/stores/nudge-store";

describe("nudge store", () => {
  beforeEach(() => {
    localStorage.clear();
    useNudgeStore.getState().reset();
  });

  it("seeds the demo nudges", () => {
    expect(useNudgeStore.getState().nudges.length).toBeGreaterThan(0);
  });

  it("marks a pending nudge as seen", () => {
    useNudgeStore.getState().markSeen("nudge_1");
    const n = useNudgeStore.getState().nudges.find((x) => x.id === "nudge_1");
    expect(n?.status).toBe("SEEN");
  });

  it("does not downgrade an already-seen nudge when marking seen", () => {
    useNudgeStore.getState().markSeen("nudge_2"); // starts SEEN
    const n = useNudgeStore.getState().nudges.find((x) => x.id === "nudge_2");
    expect(n?.status).toBe("SEEN");
  });

  it("marks a nudge as acted from any state", () => {
    useNudgeStore.getState().markActed("nudge_3"); // starts PENDING
    const n = useNudgeStore.getState().nudges.find((x) => x.id === "nudge_3");
    expect(n?.status).toBe("ACTED");
  });
});
