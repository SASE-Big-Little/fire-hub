// What happens when a mentor approves or rejects a resource.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";
import { chunkResource } from "./chunking";

type Db = SupabaseClient<Database>;
export type ReviewDecision = "approved" | "rejected";

/**
 * Sets the resource's status. On approval, (re)builds its chunks so Ask the
 * Hub can find it. On rejection, removes any chunks.
 * `db` must be the admin client: chunks are server-only.
 */
export async function reviewResource(db: Db, resourceId: string, decision: ReviewDecision) {
  const { data: resource, error } = await db
    .from("resources")
    .select("id, title, summary, content")
    .eq("id", resourceId)
    .single();
  if (error || !resource) return { error: "Resource not found." };

  // Start fresh: remove old chunks (from an earlier approval, for example).
  const { error: deleteError } = await db.from("chunks").delete().eq("resource_id", resourceId);
  if (deleteError) return { error: deleteError.message };

  if (decision === "approved") {
    const rows = chunkResource(resource).map((content, index) => ({
      resource_id: resourceId,
      chunk_index: index,
      content,
    }));
    const { error: insertError } = await db.from("chunks").insert(rows);
    if (insertError) return { error: insertError.message };
  }

  const { error: updateError } = await db
    .from("resources")
    .update({ status: decision, last_reviewed_at: new Date().toISOString() })
    .eq("id", resourceId);
  if (updateError) return { error: updateError.message };

  return { ok: true as const };
}
