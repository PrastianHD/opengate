"use client";

// SyncFromRouterButton — admin Models page header action.
//
// On click:
//   1. fetch GET /api/admin/9router/models  (proxies 9Router's /v1/models)
//   2. populate <datalist id="9router-models"> with every upstream id so the
//      ModelRow inputs become typeahead-completions
//   3. open a dialog that auto-suggests a mapping for every OpenGate model
//      whose upstream_model_id is currently empty, using slug similarity.
//      Admin can apply suggestions individually or all at once.

import { useCallback, useEffect, useState } from "react";
import { useApiAction } from "@/app/components/useApiAction";
import { useToast } from "@/app/components/Toast";

// Light fuzzy similarity: token-overlap on slug/id after normalization.
// Good enough to match "claude-opus-4.7" → "kr/claude-opus-4.7" without
// shipping a full fuzzy library.
function tokens(s) {
  return new Set(
    String(s)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
}

function similarity(a, b) {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / Math.max(ta.size, tb.size);
}

function suggestFor(slug, upstreamList) {
  let best = null;
  let bestScore = 0;
  for (const u of upstreamList) {
    const score = similarity(slug, u.id);
    if (score > bestScore) {
      bestScore = score;
      best = u;
    }
  }
  // Require at least one shared token so we don't return random matches
  // when the slug doesn't appear at all upstream.
  return bestScore > 0 ? { id: best.id, score: bestScore } : null;
}

export default function SyncFromRouterButton({ models }) {
  const { run, busy } = useApiAction();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [upstream, setUpstream] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [picks, setPicks] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await fetch("/api/admin/9router/models");
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setErrorMsg(json?.error?.message || `Failed (${res.status})`);
      setUpstream([]);
      return;
    }
    setUpstream(json.models || []);
    // Pre-fill suggestions for unmapped rows
    const next = {};
    for (const m of models) {
      if (m.upstream_model_id) continue;
      const s = suggestFor(m.slug, json.models || []);
      if (s) next[m.id] = s.id;
    }
    setPicks(next);
  }, [models]);

  useEffect(() => {
    if (!open) return;
    load();
  }, [open, load]);

  async function applyOne(modelId, upstreamId) {
    const result = await run(`/api/admin/models/${modelId}`, {
      method: "PATCH",
      body: { upstream_model_id: upstreamId },
      silent: true,
      refresh: false,
    });
    return result.ok;
  }

  async function applyAll() {
    const entries = Object.entries(picks).filter(([, v]) => v && v.length > 0);
    if (entries.length === 0) {
      toast.error("Nothing to apply");
      return;
    }
    setApplying(true);
    let okCount = 0;
    for (const [modelId, upstreamId] of entries) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await applyOne(modelId, upstreamId);
      if (ok) okCount++;
    }
    setApplying(false);
    toast.success(`Mapped ${okCount}/${entries.length} models`);
    setOpen(false);
    // Trigger a refresh so the table reflects new upstream_model_id values
    // and the datalist options remain available.
    if (typeof window !== "undefined") window.location.reload();
  }

  const unmapped = models.filter((m) => !m.upstream_model_id);

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen(true)}
        disabled={busy}
      >
        Sync from 9Router
      </button>

      {/* Shared datalist used by every ModelRow input. Always rendered so
          completions work even when the dialog is closed. */}
      <datalist id="9router-models">
        {upstream.map((u) => (
          <option key={u.id} value={u.id}>
            {u.owned_by || ""}
          </option>
        ))}
      </datalist>

      {open && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Sync upstream model ids from 9Router"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="modal modal-wide">
            <header className="modal-head">
              <h2>Sync from 9Router</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </header>

            <div className="modal-body">
              {loading && (
                <p className="text-dim">Fetching models from 9Router…</p>
              )}

              {errorMsg && (
                <div className="form-error">
                  {errorMsg}
                  <button
                    type="button"
                    className="key-action"
                    onClick={load}
                    style={{ marginLeft: 12 }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !errorMsg && (
                <>
                  <p className="dashboard-page-sub">
                    9Router exposes <strong>{upstream.length}</strong> models.{" "}
                    {unmapped.length === 0
                      ? "Every OpenGate model is already mapped — nothing to do."
                      : `Suggested mappings for ${unmapped.length} unmapped model(s) below.`}
                  </p>

                  {unmapped.length > 0 && (
                    <div className="dashboard-table-wrap">
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>OpenGate slug</th>
                            <th>Suggested upstream id</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unmapped.map((m) => (
                            <tr key={m.id}>
                              <td>
                                <strong>{m.display_name}</strong>
                                <div className="text-dim user-email">
                                  <code>{m.slug}</code>
                                </div>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="model-price-input model-upstream-input"
                                  list="9router-models"
                                  placeholder="(none)"
                                  value={picks[m.id] || ""}
                                  onChange={(e) =>
                                    setPicks((p) => ({
                                      ...p,
                                      [m.id]: e.target.value,
                                    }))
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>

            <footer className="modal-foot">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setOpen(false)}
                disabled={applying}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={applyAll}
                disabled={
                  loading ||
                  applying ||
                  !!errorMsg ||
                  Object.values(picks).filter(Boolean).length === 0
                }
              >
                {applying ? "Applying…" : "Apply all"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
