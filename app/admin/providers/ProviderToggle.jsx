"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProviderToggle({ providerId, enabled }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/providers/${providerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
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

  return (
    <button
      type="button"
      className={`key-action ${enabled ? "" : "key-action-danger"}`}
      onClick={toggle}
      disabled={busy}
    >
      {enabled ? "Disable" : "Enable"}
    </button>
  );
}
