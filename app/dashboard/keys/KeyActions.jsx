"use client";

import { useApiAction } from "@/app/components/useApiAction";
import { useConfirm } from "@/app/components/Confirm";
import { useToast } from "@/app/components/Toast";

export default function KeyActions({ keyRow }) {
  const { run, busy } = useApiAction();
  const confirm = useConfirm();
  const toast = useToast();
  const isRevoked = !!keyRow.revoked_at;

  async function toggleEnabled() {
    if (busy || isRevoked) return;
    const result = await run(`/api/keys/${keyRow.id}`, {
      method: "PATCH",
      body: { enabled: !keyRow.enabled },
    });
    if (result.ok) {
      toast.success(keyRow.enabled ? "Key disabled" : "Key enabled");
    }
  }

  async function revoke() {
    if (busy || isRevoked) return;
    const ok = await confirm({
      title: "Revoke this key?",
      message: `"${keyRow.label}" will stop working immediately. Clients using this token will fail. This cannot be undone.`,
      confirmLabel: "Revoke key",
      destructive: true,
    });
    if (!ok) return;
    const result = await run(`/api/keys/${keyRow.id}`, { method: "DELETE" });
    if (result.ok) toast.success("Key revoked");
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
        aria-pressed={keyRow.enabled}
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
