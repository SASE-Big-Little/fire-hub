import { describe, expect, it } from "vitest";
import { isValidUsername, normalizeUsername, usernameToEmail } from "@/lib/usernames";

describe("usernames", () => {
  it("trims and lowercases", () => {
    expect(normalizeUsername("  Maya ")).toBe("maya");
  });

  it("accepts simple usernames and rejects odd ones", () => {
    expect(isValidUsername("maya")).toBe(true);
    expect(isValidUsername("maya.r_2")).toBe(true);
    expect(isValidUsername("ab")).toBe(false); // too short
    expect(isValidUsername("maya r")).toBe(false); // space
    expect(isValidUsername("maya@x")).toBe(false);
  });

  it("maps a username to a hidden placeholder email", () => {
    expect(usernameToEmail(" Maya ")).toBe("maya@users.fire-hub.invalid");
  });
});
