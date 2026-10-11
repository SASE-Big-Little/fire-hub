"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Tables } from "@/lib/supabase/types";
import PasswordInput from "./PasswordInput";

type Props = { user: Tables<"profiles">; isMe: boolean };

export default function UserRow({ user, isMe }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Sends a change to the admin API, then reloads the list.
  async function send(method: "PATCH" | "DELETE", body?: object) {
    setBusy(true);
    setError(null);
    setNotice(null);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json()).error);
      return false;
    }
    router.refresh();
    return true;
  }

  async function resetPassword(event: React.FormEvent) {
    event.preventDefault();
    if (await send("PATCH", { password: newPassword })) {
      setNotice(`New password: ${newPassword}  (copy it now; it won't be shown again)`);
      setNewPassword("");
      setResetting(false);
    }
  }

  function remove() {
    if (confirm(`Delete ${user.username} for good? This can't be undone.`)) {
      send("DELETE");
    }
  }

  return (
    <li className="flex flex-col gap-2 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-40 flex-1">
          <span className="font-semibold">{user.display_name}</span>{" "}
          <span className="text-muted">({user.username})</span>
          {isMe && <span className="ml-2 text-xs text-highlight">you</span>}
          {user.disabled && <span className="ml-2 text-xs text-danger">disabled</span>}
        </div>

        <select
          value={user.role}
          disabled={busy || isMe}
          onChange={(e) => send("PATCH", { role: e.target.value })}
          className="input py-1 text-sm"
          aria-label={`Role for ${user.username}`}
        >
          <option value="mentee">Mentee</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="button"
          disabled={busy}
          onClick={() => setResetting(!resetting)}
          className="btn-secondary"
        >
          Reset password
        </button>
        <button
          type="button"
          disabled={busy || isMe}
          onClick={() => send("PATCH", { disabled: !user.disabled })}
          className="btn-secondary"
        >
          {user.disabled ? "Enable" : "Disable"}
        </button>
        <button type="button" disabled={busy || isMe} onClick={remove} className="btn-danger">
          Delete
        </button>
      </div>

      {resetting && (
        <form onSubmit={resetPassword} className="flex flex-wrap gap-2">
          <div className="min-w-64 flex-1">
            <PasswordInput value={newPassword} onChange={setNewPassword} />
          </div>
          <button type="submit" disabled={busy} className="btn-primary">
            Save new password
          </button>
        </form>
      )}

      {notice && <p className="text-sm text-success">{notice}</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
    </li>
  );
}
