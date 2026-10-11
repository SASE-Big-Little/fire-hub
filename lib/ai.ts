// THE one place that talks to an AI model.
//
// Every model call in Fire Hub goes through askModel(). To switch providers
// (challenge 17), you only change this file.
//
// Settings (environment variables):
//   AI_PROVIDER   "groq" for the real model. Anything else, including
//                 unset, uses the free "mock" model below. Previews,
//                 tests and local dev use mock so they never spend the
//                 group's shared free quota.
//   GROQ_API_KEY  secret key from console.groq.com (server only)
//   GROQ_MODEL    which Groq model to use, e.g. "openai/gpt-oss-20b"

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/** Thrown when the provider says "too many requests" (HTTP 429). */
export class AIRateLimitError extends Error {
  constructor() {
    super("The AI provider's rate limit was reached.");
  }
}

// Groq speaks the same API as OpenAI ("OpenAI-compatible").
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function askModel(messages: ChatMessage[]): Promise<string> {
  if (process.env.AI_PROVIDER === "groq") {
    return askGroq(messages);
  }
  return askMock(messages);
}

async function askGroq(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL;
  if (!apiKey || !model) {
    throw new Error("AI_PROVIDER is groq, but GROQ_API_KEY or GROQ_MODEL is missing.");
  }

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.2, // low = sticks closer to the sources
    max_completion_tokens: 800,
  };
  // gpt-oss models "think" before answering. Low effort keeps answers fast
  // and saves tokens from the free quota.
  if (model.startsWith("openai/gpt-oss")) {
    body.reasoning_effort = "low";
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.status === 429) throw new AIRateLimitError();
  if (!response.ok) {
    // Log the status only. Never log the request: it has the key in it.
    throw new Error(`Groq request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

/**
 * A pretend model. Returns a canned answer that cites the first source it
 * was given, so the whole app (citations included) works without a key.
 */
async function askMock(messages: ChatMessage[]): Promise<string> {
  const lastMessage = messages[messages.length - 1]?.content ?? "";
  const hasSource = lastMessage.includes("[1]");
  if (!hasSource) return "I don't know. (mock answer)";
  return (
    "This is a mock answer from Fire Hub's pretend AI. The real model would answer " +
    "from the source below [1]. Set AI_PROVIDER=groq to use it."
  );
}
