import { describe, expect, it } from "vitest";
import { checkPassword, generatePassword } from "@/lib/passwords";

describe("generatePassword", () => {
  it("looks like word-word-number and is long enough", () => {
    for (let i = 0; i < 50; i++) {
      const password = generatePassword();
      expect(password).toMatch(/^[a-z]+-[a-z]+-\d{2}$/);
      expect(checkPassword(password)).toBeNull();
    }
  });
});

describe("checkPassword", () => {
  it("rejects short passwords", () => {
    expect(checkPassword("short")).toMatch(/at least 8/);
  });
});
