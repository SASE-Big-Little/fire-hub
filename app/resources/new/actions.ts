"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { validateResource } from "@/lib/resources";

export type SubmitState = { error: string | null; success: boolean };

export async function submitResource(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Please sign in again.", success: false };

  const result = validateResource({
    title: String(formData.get("title") ?? ""),
    url: String(formData.get("url") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    content: String(formData.get("content") ?? ""),
    type: String(formData.get("type") ?? ""),
    tags: String(formData.get("tags") ?? ""),
  });
  if ("error" in result) return { error: result.error, success: false };

  // Uses the member's own client, so the database's rules apply:
  // it can only be saved as "pending", submitted by this member.
  const supabase = await createClient();
  const { error } = await supabase.from("resources").insert({
    ...result.data,
    submitted_by: profile.id,
    status: "pending",
  });
  if (error) return { error: `Could not save: ${error.message}`, success: false };

  return { error: null, success: true };
}
