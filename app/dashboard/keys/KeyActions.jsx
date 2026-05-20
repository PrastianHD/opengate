"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function KeyActions({ keyRow }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isRevoked = !!keyRow.revoked_at;

  async function toggleEnabled() {
    if (busy || isRevoked) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/keys/${keyRow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !keyRow.enabled }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error?.message || "Update failed");
      } else {
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    if (busy || isRevoked) return;
    if (
      !confirm(
        `Revoke key "${keyRow.label}"? This cannot be undone — clients using this token will fail.`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/keys/${keyRow.id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error?.message || "Revoke failed");
      } else {
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  if (isRevoked) {
    return <span className="key-actions-disabled">—</span>;
  }

  return (
    <div className="key-actions">
      <button
        type="button"
        className="key-action"
        onClick={toggleEnabled}
        disabled={busy}
        title={keyRow.enabled ? "Disable" : "Enable"}
      >
        {keyRow.enabled ? "Disable" : "Enable"}
      </button>
      <button
        type="button"
        className="key-action key-action-danger"
        onClick={revoke}
        disabled={busy}
      >
        Revoke
      </button>
    </div>
  );
}
