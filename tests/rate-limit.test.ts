import { describe, expect, it } from "vitest";
import { ASK_LIMIT, checkRateLimit } from "@/lib/rate-limit";

const now = new Date("2026-10-11T12:00:00Z");
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000);

describe("checkRateLimit (10 questions per hour)", () => {
  it("allows the first question", () => {
    expect(checkRateLimit([], ASK_LIMIT, now)).toEqual({
      allowed: true,
      remaining: 10,
      retryAfterMinutes: 0,
    });
  });

  it("allows the 10th question", () => {
    const nine = Array.from({ length: 9 }, (_, i) => minutesAgo(i));
    expect(checkRateLimit(nine, ASK_LIMIT, now)).toMatchObject({ allowed: true, remaining: 1 });
  });

  it("blocks the 11th question and says when to retry", () => {
    // Oldest question was 50 minutes ago, so it expires in 10 minutes.
    const ten = Array.from({ length: 10 }, (_, i) => minutesAgo(50 - i));
    expect(checkRateLimit(ten, ASK_LIMIT, now)).toEqual({
      allowed: false,
      remaining: 0,
      retryAfterMinutes: 10,
    });
  });

  it("ignores questions older than an hour", () => {
    const old = Array.from({ length: 10 }, () => minutesAgo(61));
    expect(checkRateLimit(old, ASK_LIMIT, now)).toMatchObject({ allowed: true, remaining: 10 });
  });
});
