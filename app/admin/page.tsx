import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import AddUserForm from "./AddUserForm";
import UserRow from "./UserRow";

export const metadata = { title: "Admin · Fire Hub" };

export default async function AdminPage() {
  const me = await getCurrentProfile();
  // Non-admins get a plain "not found", as if the page didn't exist.
  if (me?.role !== "admin") notFound();

  if (!hasServiceRoleKey()) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="mb-2 text-2xl font-bold">Admin</h1>
        <p className="text-muted">
          The admin page needs SUPABASE_SERVICE_ROLE_KEY in .env.local. See &quot;Full setup&quot;
          in the README.
        </p>
      </main>
    );
  }

  const { data: users, error } = await createAdminClient()
    .from("profiles")
    .select("*")
    .order("created_at");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">Admin</h1>
        <Link href="/admin/resources">Resource approval queue →</Link>
      </div>

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Add a member</h2>
        <AddUserForm />
      </section>

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Members ({users?.length ?? 0})</h2>
        {error && <p className="text-danger">Could not load members: {error.message}</p>}
        <ul className="flex flex-col divide-y divide-border">
          {users?.map((user) => (
            <UserRow key={user.id} user={user} isMe={user.id === me.id} />
          ))}
        </ul>
      </section>
    </main>
  );
}
