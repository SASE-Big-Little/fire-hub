// PATCH  /api/admin/users/<id>: change role, disable/enable, or reset password.
// DELETE /api/admin/users/<id>: delete the account for good.
// Admins only. Admins can't demote, disable or delete themselves, so the hub
// can never end up with no admin by accident.
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkPassword } from "@/lib/passwords";
import { ROLES, type Role } from "@/lib/users";

// Banning in Supabase Auth stops a disabled person from refreshing their
// session. "none" lifts the ban.
const BAN_FOREVER = "876000h"; // about 100 years

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  const { profile: me, response } = await requireAdmin();
  if (response) return response;

  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const admin = createAdminClient();
  const isMe = id === me.id;

  if (body.role !== undefined) {
    const role = body.role as Role;
    if (!ROLES.includes(role)) return badRequest("Role must be admin or mentee.");
    if (isMe && role !== "admin") return badRequest("You can't remove your own admin role.");
    const { error } = await admin.from("profiles").update({ role }).eq("id", id);
    if (error) return badRequest(error.message);
  }

  if (body.disabled !== undefined) {
    const disabled = Boolean(body.disabled);
    if (isMe && disabled) return badRequest("You can't disable your own account.");
    const { error } = await admin.from("profiles").update({ disabled }).eq("id", id);
    if (error) return badRequest(error.message);
    await admin.auth.admin.updateUserById(id, {
      ban_duration: disabled ? BAN_FOREVER : "none",
    });
  }

  if (body.password !== undefined) {
    const password = String(body.password);
    const problem = checkPassword(password);
    if (problem) return badRequest(problem);
    const { error } = await admin.auth.admin.updateUserById(id, { password });
    if (error) return badRequest(error.message);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  const { profile: me, response } = await requireAdmin();
  if (response) return response;

  const { id } = await ctx.params;
  if (id === me.id) return badRequest("You can't delete your own account.");

  // Deleting the auth user also deletes their profile (on delete cascade).
  // Resources they submitted stay, with "submitted by" left empty.
  const { error } = await createAdminClient().auth.admin.deleteUser(id);
  if (error) return badRequest(error.message);
  return NextResponse.json({ ok: true });
}
