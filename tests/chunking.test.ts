import { describe, expect, it } from "vitest";
import { chunkResource, splitIntoChunks, TARGET_CHUNK_SIZE } from "@/lib/chunking";

const sentence = "Good questions show what you already tried. "; // 44 characters

describe("splitIntoChunks", () => {
  it("returns nothing for empty text", () => {
    expect(splitIntoChunks("")).toEqual([]);
    expect(splitIntoChunks("  \n\n  ")).toEqual([]);
  });

  it("keeps short text as one chunk", () => {
    expect(splitIntoChunks("Hello there.")).toEqual(["Hello there."]);
  });

  it("joins short paragraphs into one chunk", () => {
    const text = "First paragraph.\n\nSecond paragraph.";
    expect(splitIntoChunks(text)).toEqual(["First paragraph.\n\nSecond paragraph."]);
  });

  it("starts a new chunk when the next paragraph doesn't fit", () => {
    const a = "a".repeat(500);
    const b = "b".repeat(500);
    expect(splitIntoChunks(`${a}\n\n${b}`)).toEqual([a, b]);
  });

  it("splits a long paragraph at sentence ends", () => {
    const paragraph = sentence.repeat(40).trim(); // about 1,760 characters
    const chunks = splitIntoChunks(paragraph);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(TARGET_CHUNK_SIZE);
      expect(chunk.endsWith(".")).toBe(true); // never cut mid-sentence
    }
  });

  it("never makes a chunk longer than the limit, even with no spaces", () => {
    const chunks = splitIntoChunks("x".repeat(2000));
    expect(chunks.map((c) => c.length)).toEqual([800, 800, 400]);
  });

  it("doesn't lose any words", () => {
    const text = `${sentence.repeat(30)}\n\nShort one.\n\n${"word ".repeat(300)}`;
    const words = (s: string) => s.split(/\s+/).filter(Boolean);
    expect(words(splitIntoChunks(text).join(" "))).toEqual(words(text));
  });
});

describe("chunkResource", () => {
  it("puts the title at the start of every chunk and stays under the limit", () => {
    const chunks = chunkResource({
      title: "Asking good questions",
      summary: "How to ask for help.",
      content: sentence.repeat(60),
    });
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.startsWith("Asking good questions\n")).toBe(true);
      expect(chunk.length).toBeLessThanOrEqual(TARGET_CHUNK_SIZE);
    }
  });
});
