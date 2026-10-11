// Shared rules for resources: allowed types and form validation.
// The database checks the same limits (see supabase/migrations).

export const RESOURCE_TYPES = ["article", "video", "book", "course", "tool", "other"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const MAX_TAGS = 8;

export type ResourceInput = {
  title: string;
  url: string | null;
  summary: string;
  content: string;
  type: ResourceType;
  tags: string[];
};

/** "Career, Interviews , career" -> ["career", "interviews"] */
export function parseTags(raw: string): string[] {
  const tags = raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);
  return [...new Set(tags)];
}

/** Checks a submitted form. Returns clean data, or an error message. */
export function validateResource(form: {
  title: string;
  url: string;
  summary: string;
  content: string;
  type: string;
  tags: string;
}): { data: ResourceInput } | { error: string } {
  const title = form.title.trim();
  const url = form.url.trim();
  const summary = form.summary.trim();
  const content = form.content.trim();
  const tags = parseTags(form.tags);

  if (title.length < 3 || title.length > 200) {
    return { error: "Title must be 3 to 200 characters." };
  }
  if (url && !/^https?:\/\/\S+$/.test(url)) {
    return { error: "Link must start with http:// or https://" };
  }
  if (summary.length < 10 || summary.length > 1000) {
    return { error: "Summary must be 10 to 1,000 characters." };
  }
  if (content.length > 50000) {
    return { error: "Content must be at most 50,000 characters." };
  }
  if (!RESOURCE_TYPES.includes(form.type as ResourceType)) {
    return { error: "Pick a type from the list." };
  }
  if (tags.length > MAX_TAGS || tags.some((t) => t.length > 30)) {
    return { error: `Use at most ${MAX_TAGS} tags, each up to 30 characters.` };
  }

  return {
    data: { title, url: url || null, summary, content, type: form.type as ResourceType, tags },
  };
}
