// POST /api/admin/users: create a member account. Admins only.
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMember, type Role } from "@/lib/users";

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await request.json().catch(() => ({}));
  const result = await createMember(createAdminClient(), {
    username: String(body.username ?? ""),
    displayName: String(body.displayName ?? ""),
    role: body.role as Role,
    password: String(body.password ?? ""),
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ id: result.id }, { status: 201 });
}
