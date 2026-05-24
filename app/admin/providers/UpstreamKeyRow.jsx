"use client";

import { useApiAction } from "@/app/components/useApiAction";
import { useConfirm } from "@/app/components/Confirm";
import { useToast } from "@/app/components/Toast";
import Pill from "@/app/components/Pill";

export default function UpstreamKeyRow({ keyRow }) {
  const { run, busy } = useApiAction();
  const confirm = useConfirm();
  const toast = useToast();

  const isCooldown =
    keyRow.cooldown_until && new Date(keyRow.cooldown_until) > new Date();

  async function toggle() {
    const result = await run(`/api/admin/upstream-keys/${keyRow.id}`, {
      method: "PATCH",
      body: { enabled: !keyRow.enabled },
    });
    if (result.ok) {
      toast.success(keyRow.enabled ? "Upstream key disabled" : "Upstream key enabled");
    }
  }

  async function remove() {
    const ok = await confirm({
      title: "Delete upstream key?",
      message: `"${keyRow.label}" will be removed permanently. The gateway will fall back to other keys for this provider.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    const result = await run(`/api/admin/upstream-keys/${keyRow.id}`, {
      method: "DELETE",
    });
    if (result.ok) toast.success("Upstream key deleted");
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
        <Pill status={status} />
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
            onClick={toggle}
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
