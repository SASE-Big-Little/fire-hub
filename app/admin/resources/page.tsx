import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ReviewButtons from "./ReviewButtons";

export const metadata = { title: "Approval queue · Fire Hub" };

export default async function ApprovalQueuePage() {
  const me = await getCurrentProfile();
  if (me?.role !== "admin") notFound();

  // Admins can read every resource (see the RLS policy), so the normal
  // client is enough here.
  const supabase = await createClient();
  const { data: pending, error } = await supabase
    .from("resources")
    .select("*, submitter:profiles(display_name, username)")
    .eq("status", "pending")
    .order("created_at");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">Approval queue</h1>
        <Link href="/admin">← Members</Link>
      </div>

      {error && <p className="text-danger">Could not load: {error.message}</p>}
      {pending?.length === 0 && <p className="text-muted">Nothing waiting. 🎉</p>}

      <ul className="flex flex-col gap-4">
        {pending?.map((resource) => (
          <li key={resource.id} className="card flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-semibold">{resource.title}</h2>
              <p className="text-sm text-muted">
                {resource.type} · submitted by{" "}
                {resource.submitter?.display_name ?? "a former member"} ·{" "}
                {new Date(resource.created_at).toLocaleDateString()}
              </p>
            </div>
            {resource.url && (
              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="break-all">
                {resource.url}
              </a>
            )}
            <p>{resource.summary}</p>
            {resource.content && (
              <details>
                <summary className="cursor-pointer text-sm text-muted">
                  Content ({resource.content.length.toLocaleString()} characters)
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-sm">{resource.content}</p>
              </details>
            )}
            {resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <span key={tag} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <ReviewButtons resourceId={resource.id} />
          </li>
        ))}
      </ul>
    </main>
  );
}
