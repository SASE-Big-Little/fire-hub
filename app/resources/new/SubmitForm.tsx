"use client";

import { useActionState } from "react";
import Link from "next/link";
import { RESOURCE_TYPES } from "@/lib/resources";
import { submitResource, type SubmitState } from "./actions";

const initialState: SubmitState = { error: null, success: false };

export default function SubmitForm() {
  const [state, formAction, pending] = useActionState(submitResource, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-success">Thanks! A mentor will review it soon.</p>
        <div className="flex gap-3">
          {/* A plain <a> reloads the page, which gives a fresh, empty form. */}
          <a href="/resources/new" className="btn-secondary">
            Submit another
          </a>
          <Link href="/resources" className="btn-secondary">
            Back to resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Title *</span>
        <input name="title" required minLength={3} maxLength={200} className="input" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Link (optional)</span>
        <input name="url" type="url" placeholder="https://…" className="input" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Type *</span>
        <select name="type" defaultValue="article" className="input">
          {RESOURCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Summary * (one or two sentences)</span>
        <textarea name="summary" required minLength={10} maxLength={1000} rows={2} className="input" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">
          Content: the key points, notes, or the article text. Ask the Hub answers from this.
        </span>
        <textarea name="content" maxLength={50000} rows={10} className="input" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Tags (comma-separated, e.g. career, interviews)</span>
        <input name="tags" className="input" />
      </label>

      {state.error && (
        <p role="alert" className="text-danger">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary self-start">
        {pending ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
