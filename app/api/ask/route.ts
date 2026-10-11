// POST /api/ask   body: { "question": "..." }
// Signed-in members only. 10 questions per hour each.
import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { askModel, AIRateLimitError } from "@/lib/ai";
import { answerQuestion, MAX_CHUNKS, MAX_QUESTION_LENGTH } from "@/lib/ask";
import { ASK_LIMIT, checkAskLimit, recordQuestion } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { profile, response } = await requireMember();
  if (response) return response;

  const body = await request.json().catch(() => ({}));
  const question = String(body.question ?? "").trim();
  if (!question) {
    return NextResponse.json({ error: "Type a question first." }, { status: 400 });
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json(
      { error: `Please keep questions under ${MAX_QUESTION_LENGTH} characters.` },
      { status: 400 },
    );
  }

  if (!hasServiceRoleKey()) {
    return NextResponse.json(
      { error: 'Ask the Hub needs SUPABASE_SERVICE_ROLE_KEY. See "Full setup" in the README.' },
      { status: 503 },
    );
  }

  // chunks and ai_usage are server-only tables, so we use the admin client,
  // but only after requireMember() confirmed who is asking.
  const db = createAdminClient();

  const limit = await checkAskLimit(db, profile.id);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `You've asked ${ASK_LIMIT.max} questions this hour. Try again in ${limit.retryAfterMinutes} minute(s).`,
      },
      { status: 429 },
    );
  }

  try {
    const result = await answerQuestion(question, {
      search: async (q) => {
        const { data, error } = await db.rpc("search_chunks", { query: q, match_count: MAX_CHUNKS });
        if (error) throw new Error(`Search failed: ${error.message}`);
        return data;
      },
      askModel,
      recordUsage: () => recordQuestion(db, profile.id),
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AIRateLimitError) {
      return NextResponse.json(
        { error: "Ask the Hub is very busy right now. Please try again in a few minutes." },
        { status: 503 },
      );
    }
    console.error("Ask the Hub failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
