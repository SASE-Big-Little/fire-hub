"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewButtons({ resourceId }: { resourceId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function review(decision: "approved" | "rejected") {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/resources/${resourceId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json()).error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" disabled={busy} onClick={() => review("approved")} className="btn-primary">
        Approve
      </button>
      <button type="button" disabled={busy} onClick={() => review("rejected")} className="btn-danger">
        Reject
      </button>
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}
