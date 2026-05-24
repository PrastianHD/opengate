"use client";

import { useApiAction } from "@/app/components/useApiAction";
import { useToast } from "@/app/components/Toast";

export default function ProviderToggle({ providerId, enabled }) {
  const { run, busy } = useApiAction();
  const toast = useToast();

  async function toggle() {
    const result = await run(`/api/admin/providers/${providerId}`, {
      method: "PATCH",
      body: { enabled: !enabled },
    });
    if (result.ok) {
      toast.success(enabled ? "Provider disabled" : "Provider enabled");
    }
  }

  return (
    <button
      type="button"
      className={`key-action ${enabled ? "" : "key-action-danger"}`}
      onClick={toggle}
      disabled={busy}
      aria-pressed={enabled}
    >
      {enabled ? "Disable" : "Enable"}
    </button>
  );
}
