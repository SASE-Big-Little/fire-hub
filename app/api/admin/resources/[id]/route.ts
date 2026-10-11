// POST /api/admin/resources/<id>  body: { "decision": "approved" | "rejected" }
// Admins only. Approving also splits the resource into chunks for Ask the Hub.
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { reviewResource, type ReviewDecision } from "@/lib/approval";

export async function POST(request: Request, ctx: RouteContext<"/api/admin/resources/[id]">) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const decision = body.decision as ReviewDecision;
  if (decision !== "approved" && decision !== "rejected") {
    return NextResponse.json({ error: "decision must be approved or rejected" }, { status: 400 });
  }

  const result = await reviewResource(createAdminClient(), id, decision);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
