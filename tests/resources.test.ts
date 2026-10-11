import { describe, expect, it } from "vitest";
import { parseTags, validateResource } from "@/lib/resources";

const valid = {
  title: "How to ask good questions",
  url: "https://example.com/questions",
  summary: "A short guide to asking for help well.",
  content: "Say what you tried. Say what you expected.",
  type: "article",
  tags: "Questions, help",
};

describe("parseTags", () => {
  it("lowercases, trims and removes duplicates", () => {
    expect(parseTags("Career, Interviews , career,,")).toEqual(["career", "interviews"]);
  });
});

describe("validateResource", () => {
  it("accepts a good submission", () => {
    expect(validateResource(valid)).toEqual({
      data: { ...valid, tags: ["questions", "help"] },
    });
  });

  it("allows an empty link", () => {
    const result = validateResource({ ...valid, url: "" });
    expect("data" in result && result.data.url).toBeNull();
  });

  it("rejects bad input with a helpful message", () => {
    expect(validateResource({ ...valid, title: "Hi" })).toEqual({
      error: "Title must be 3 to 200 characters.",
    });
    expect(validateResource({ ...valid, url: "example.com" })).toHaveProperty("error");
    expect(validateResource({ ...valid, type: "podcast" })).toHaveProperty("error");
  });
});
