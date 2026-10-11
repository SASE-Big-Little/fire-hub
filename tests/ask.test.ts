import { describe, expect, it, vi } from "vitest";
import { answerQuestion, NO_MATCH_ANSWER, SYSTEM_PROMPT, type ChunkMatch } from "@/lib/ask";
import { askModel, type ChatMessage } from "@/lib/ai";

const chunk = (id: number, resourceId: string, title: string, content: string): ChunkMatch => ({
  chunk_id: id,
  resource_id: resourceId,
  resource_title: title,
  resource_url: null,
  content,
});

function fakeDeps(matches: ChunkMatch[], modelAnswer = "Explain what you tried [1].") {
  return {
    search: vi.fn(async () => matches),
    askModel: vi.fn(async (messages: ChatMessage[]) => (messages.length ? modelAnswer : "")),
    recordUsage: vi.fn(async () => {}),
  };
}

describe("answerQuestion", () => {
  it("does NOT call the model when nothing matches", async () => {
    const deps = fakeDeps([]);
    const result = await answerQuestion("What is photosynthesis?", deps);

    expect(deps.askModel).not.toHaveBeenCalled();
    expect(deps.recordUsage).not.toHaveBeenCalled(); // doesn't count toward the limit
    expect(result).toEqual({ answer: NO_MATCH_ANSWER, sources: [], noMatch: true });
  });

  it("sends only the matching chunks to the model, with the system prompt", async () => {
    const deps = fakeDeps([chunk(1, "r1", "Asking good questions", "Say what you tried.")]);
    await answerQuestion("How do I ask for help?", deps);

    expect(deps.recordUsage).toHaveBeenCalledOnce();
    const messages = deps.askModel.mock.calls[0][0];
    expect(messages[0]).toEqual({ role: "system", content: SYSTEM_PROMPT });
    expect(messages[1].content).toContain("[1] Asking good questions\nSay what you tried.");
    expect(messages[1].content).toContain("Question: How do I ask for help?");
  });

  it("numbers each resource once and returns only the cited ones", async () => {
    const deps = fakeDeps(
      [
        chunk(1, "r1", "Asking good questions", "Say what you tried."),
        chunk(2, "r2", "Office hours", "Bring your code."),
        chunk(3, "r1", "Asking good questions", "Share the error message."),
      ],
      "Bring your code [2].",
    );
    const result = await answerQuestion("How should I prepare?", deps);

    const userMessage = deps.askModel.mock.calls[0][0][1].content;
    expect(userMessage).toContain("[1] Asking good questions\nShare the error message.");
    expect(result.sources).toEqual([{ id: "r2", title: "Office hours", url: null }]);
    expect(result.noMatch).toBe(false);
  });

  it("returns no sources when the model says it doesn't know", async () => {
    const deps = fakeDeps([chunk(1, "r1", "Title", "Text")], "I don't know.");
    const result = await answerQuestion("Something else?", deps);
    expect(result.sources).toEqual([]);
  });
});

describe("askModel in mock mode", () => {
  it("returns a canned answer without calling any API", async () => {
    vi.stubEnv("AI_PROVIDER", "mock");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const answer = await askModel([{ role: "user", content: "Sources: [1] X\n\nQuestion: hi" }]);
    expect(answer).toContain("[1]");
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
});
