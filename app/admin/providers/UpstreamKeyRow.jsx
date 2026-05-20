"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpstreamKeyRow({ keyRow }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const isCooldown =
    keyRow.cooldown_until && new Date(keyRow.cooldown_until) > new Date();

  async function patch(body) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/upstream-keys/${keyRow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  async function remove() {
    if (
      !confirm(
        `Delete upstream key "${keyRow.label}"? This cannot be undone — the gateway will fall back to other keys.`
      )
    )
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/upstream-keys/${keyRow.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error?.message || "Delete failed");
      } else {
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  const status = !keyRow.enabled
    ? "disabled"
    : isCooldown
    ? "cooldown"
    : "active";

  return (
    <tr>
      <td>
        <strong>{keyRow.label}</strong>
      </td>
      <td>
        <code>…{keyRow.api_key_last4 || "????"}</code>
      </td>
      <td>
        <span
          className={`pill pill-${
            status === "active"
              ? "active"
              : status === "cooldown"
              ? "debit"
              : "expired"
          }`}
        >
          {status}
        </span>
      </td>
      <td>{keyRow.priority}</td>
      <td>{keyRow.weight}</td>
      <td className="dashboard-time">
        {isCooldown ? new Date(keyRow.cooldown_until).toLocaleString() : "—"}
      </td>
      <td className="dashboard-desc">{keyRow.last_error || "—"}</td>
      <td>
        <div className="key-actions">
          <button
            type="button"
            className="key-action"
            onClick={() => patch({ enabled: !keyRow.enabled })}
            disabled={busy}
          >
            {keyRow.enabled ? "Disable" : "Enable"}
          </button>
          <button
            type="button"
            className="key-action key-action-danger"
            onClick={remove}
            disabled={busy}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
