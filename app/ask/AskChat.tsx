"use client";

import { useState } from "react";
import Link from "next/link";
import type { Source } from "@/lib/ask";

type Turn =
  | { role: "user"; text: string }
  | { role: "hub"; text: string; sources: Source[] }
  | { role: "error"; text: string };

export default function AskChat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState("");
  const [waiting, setWaiting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const asked = question.trim();
    if (!asked) return;

    setTurns((t) => [...t, { role: "user", text: asked }]);
    setQuestion("");
    setWaiting(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: asked }),
      });
      const data = await res.json();
      setTurns((t) => [
        ...t,
        res.ok
          ? { role: "hub", text: data.answer, sources: data.sources }
          : { role: "error", text: data.error },
      ]);
    } catch {
      setTurns((t) => [...t, { role: "error", text: "Couldn't reach Fire Hub. Check your connection." }]);
    } finally {
      setWaiting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {turns.map((turn, i) => (
          <li
            key={i}
            className={
              turn.role === "user"
                ? "self-end rounded-xl bg-accent px-4 py-2 text-accent-foreground"
                : "card whitespace-pre-wrap py-4"
            }
          >
            <p className={turn.role === "error" ? "text-danger" : ""}>{turn.text}</p>

            {/* Sources. Challenge 11 turns these into nicer clickable chips. */}
            {turn.role === "hub" && turn.sources.length > 0 && (
              <div className="mt-3 text-sm text-muted">
                Sources:{" "}
                {turn.sources.map((source, n) => (
                  <span key={source.id}>
                    {n > 0 && ", "}
                    <Link href={`/resources#${source.id}`}>{source.title}</Link>
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
        {waiting && <li className="text-muted">Thinking…</li>}
      </ul>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. How do I ask my mentor a good question?"
          maxLength={500}
          className="input flex-1"
          aria-label="Your question"
        />
        <button type="submit" disabled={waiting || !question.trim()} className="btn-primary">
          Ask
        </button>
      </form>
    </div>
  );
}
