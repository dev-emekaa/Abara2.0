import { rateLimit, _resetRateLimit } from "@/lib/rate-limit";

beforeEach(() => _resetRateLimit());

describe("rateLimit", () => {
  const opts = { limit: 3, windowMs: 60_000 };

  it("allows requests up to the limit, then blocks", () => {
    const t = 1_000_000;
    expect(rateLimit("u1", opts, t).allowed).toBe(true);
    expect(rateLimit("u1", opts, t).allowed).toBe(true);
    expect(rateLimit("u1", opts, t).allowed).toBe(true);
    const blocked = rateLimit("u1", opts, t);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("reports remaining quota", () => {
    const t = 2_000_000;
    expect(rateLimit("u2", opts, t).remaining).toBe(2);
    expect(rateLimit("u2", opts, t).remaining).toBe(1);
    expect(rateLimit("u2", opts, t).remaining).toBe(0);
  });

  it("resets after the window elapses", () => {
    const t = 3_000_000;
    rateLimit("u3", opts, t);
    rateLimit("u3", opts, t);
    rateLimit("u3", opts, t);
    expect(rateLimit("u3", opts, t).allowed).toBe(false);
    // After the window, the bucket resets.
    expect(rateLimit("u3", opts, t + 60_001).allowed).toBe(true);
  });

  it("tracks keys independently", () => {
    const t = 4_000_000;
    rateLimit("a", opts, t);
    rateLimit("a", opts, t);
    rateLimit("a", opts, t);
    expect(rateLimit("a", opts, t).allowed).toBe(false);
    expect(rateLimit("b", opts, t).allowed).toBe(true);
  });
});
