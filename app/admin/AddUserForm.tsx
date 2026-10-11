"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "./PasswordInput";

export default function AddUserForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"mentee" | "admin">("mentee");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, displayName, role, password }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage({ ok: false, text: data.error });
      return;
    }
    // Show the password ONE time so you can pass it on. It's never shown again.
    setMessage({
      ok: true,
      text: `Created "${username}". Their password is: ${password}  (copy it now; it won't be shown again)`,
    });
    setUsername("");
    setDisplayName("");
    setPassword("");
    setRole("mentee");
    router.refresh(); // reload the member list
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Username (used to sign in)</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. maya"
          autoCapitalize="none"
          required
          className="input"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Display name</span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Maya R."
          required
          className="input"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Role</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "mentee" | "admin")}
          className="input"
        >
          <option value="mentee">Mentee</option>
          <option value="admin">Admin (mentor)</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Password</span>
        <PasswordInput value={password} onChange={setPassword} />
      </label>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <button type="submit" disabled={saving} className="btn-primary self-start">
          {saving ? "Creating…" : "Create member"}
        </button>
        {message && (
          <p role="status" className={message.ok ? "text-success" : "text-danger"}>
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
