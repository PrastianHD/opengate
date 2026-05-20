import { createClient } from "@/lib/supabase/server";
import KeysToolbar from "./KeysToolbar";
import KeyActions from "./KeyActions";

export const metadata = {
  title: "API Keys | OpenGates",
};

const MICRO_PER_USD = 1_000_000;

function formatUsd(microCents) {
  if (microCents == null) return "—";
  const usd = microCents / MICRO_PER_USD;
  return usd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 4,
  });
}

function formatDate(iso) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusOf(k) {
  if (k.revoked_at) return "revoked";
  if (!k.enabled) return "disabled";
  if (k.expires_at && new Date(k.expires_at) < new Date()) return "expired";
  return "active";
}

export default async function KeysPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: keys }, { data: models }] = await Promise.all([
    supabase
      .from("gateway_keys")
      .select(
        "id, label, key_prefix, key_last4, enabled, model_whitelist, rpm_cap, spending_cap_micro_cents, spending_used_micro_cents, expires_at, last_used_at, revoked_at, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("models")
      .select("slug, display_name")
      .eq("enabled", true)
      .order("slug"),
  ]);

  return (
    <div className="dashboard-page">
      <header className="dashboard-page-head dashboard-page-head-row">
        <div>
          <h1>API Keys</h1>
          <p className="dashboard-page-sub">
            Manage tokens that authenticate requests to the OpenGates gateway.
          </p>
        </div>
        <KeysToolbar availableModels={models || []} />
      </header>

      {!keys || keys.length === 0 ? (
        <div className="dashboard-empty">
          <h3>No keys yet</h3>
          <p>
            Create your first key to start sending requests to{" "}
            <code>api.opengates.cloud/v1</code>. Each key has its own spending cap
            and model whitelist.
          </p>
        </div>
      ) : (
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Key</th>
                <th>Status</th>
                <th>Spending</th>
                <th>Whitelist</th>
                <th>Last used</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => {
                const status = statusOf(k);
                const wl = k.model_whitelist;
                return (
                  <tr key={k.id}>
                    <td>
                      <strong>{k.label}</strong>
                    </td>
                    <td>
                      <code>
                        {k.key_prefix}…{k.key_last4}
                      </code>
                    </td>
                    <td>
                      <span className={`pill pill-${status}`}>{status}</span>
                    </td>
                    <td>
                      {formatUsd(k.spending_used_micro_cents)}
                      {k.spending_cap_micro_cents
                        ? ` / ${formatUsd(k.spending_cap_micro_cents)}`
                        : ""}
                    </td>
                    <td className="dashboard-desc">
                      {wl && wl.length > 0 ? (
                        <span title={wl.join(", ")}>{wl.length} models</span>
                      ) : (
                        <span className="text-dim">All</span>
                      )}
                    </td>
                    <td>{formatDate(k.last_used_at)}</td>
                    <td>{formatDate(k.created_at)}</td>
                    <td>
                      <KeyActions keyRow={k} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
