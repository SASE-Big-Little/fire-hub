import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Resources · Fire Hub" };

// A simple list of approved resources.
// Search and tag filters are challenge 7. A nicer card is challenge 3.
export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data: resources, error } = await supabase
    .from("resources")
    .select("id, title, url, summary, type, tags")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Resources</h1>
        <Link href="/resources/new" className="btn-primary">
          Submit a resource
        </Link>
      </div>

      {error && <p className="text-danger">Could not load resources: {error.message}</p>}
      {resources?.length === 0 && (
        <p className="text-muted">No resources yet. Be the first to submit one!</p>
      )}

      <ul id="resources" className="flex flex-col gap-4">
        {resources?.map((resource) => (
          <li key={resource.id} id={resource.id} className="card flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-lg font-semibold">
                {resource.url ? (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.title}
                  </a>
                ) : (
                  resource.title
                )}
              </h2>
              <span className="text-xs uppercase tracking-wide text-muted">{resource.type}</span>
            </div>
            <p className="text-muted">{resource.summary}</p>
            {resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <span key={tag} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
