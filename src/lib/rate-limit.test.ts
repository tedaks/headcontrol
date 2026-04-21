import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows the first few requests", () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimit("ip", 5, 60_000).allowed).toBe(true);
    }
  });

  it("blocks after max attempts", () => {
    for (let i = 0; i < 5; i++) {
      rateLimit("ip", 5, 60_000);
    }
    const result = rateLimit("ip", 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("resets after the window expires", () => {
    rateLimit("ip", 1, 60_000);
    expect(rateLimit("ip", 1, 60_000).allowed).toBe(false);
    vi.advanceTimersByTime(61_000);
    expect(rateLimit("ip", 1, 60_000).allowed).toBe(true);
  });

  it("isolates different keys", () => {
    rateLimit("a", 1, 60_000);
    expect(rateLimit("a", 1, 60_000).allowed).toBe(false);
    expect(rateLimit("b", 1, 60_000).allowed).toBe(true);
  });
});
