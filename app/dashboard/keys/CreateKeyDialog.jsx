"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateKeyDialog({ availableModels, open, onClose, onCreated }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [whitelist, setWhitelist] = useState([]);
  const [rpmCap, setRpmCap] = useState("");
  const [spendingCapUsd, setSpendingCapUsd] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setLabel("");
      setWhitelist([]);
      setRpmCap("");
      setSpendingCapUsd("");
      setExpiresAt("");
      setLoading(false);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          model_whitelist: whitelist.length ? whitelist : null,
          rpm_cap: rpmCap || null,
          spending_cap_usd: spendingCapUsd || null,
          expires_at: expiresAt || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Failed to create key");
      onCreated?.(json.plaintext);
      router.refresh();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  function toggleModel(slug) {
    setWhitelist((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal-head">
          <h2>New API key</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <form onSubmit={submit} className="modal-body">
          <label className="form-row">
            <span>Label</span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Cursor, Cline, Production…"
              required
              maxLength={60}
              autoFocus
            />
          </label>

          <fieldset className="form-row">
            <legend>Model whitelist (optional)</legend>
            <p className="form-hint">
              Leave empty to allow all models. Selecting models locks this key
              to only those slugs.
            </p>
            <div className="model-checkbox-grid">
              {availableModels.map((m) => (
                <label key={m.slug} className="model-checkbox">
                  <input
                    type="checkbox"
                    checked={whitelist.includes(m.slug)}
                    onChange={() => toggleModel(m.slug)}
                  />
                  <span>
                    <strong>{m.display_name}</strong>
                    <em>{m.slug}</em>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="form-grid">
            <label className="form-row">
              <span>RPM cap (optional)</span>
              <input
                type="number"
                min={1}
                max={10000}
                value={rpmCap}
                onChange={(e) => setRpmCap(e.target.value)}
                placeholder="Inherit from account"
              />
            </label>

            <label className="form-row">
              <span>Spending cap USD (optional)</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={spendingCapUsd}
                onChange={(e) => setSpendingCapUsd(e.target.value)}
                placeholder="No cap"
              />
            </label>

            <label className="form-row">
              <span>Expires at (optional)</span>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </label>
          </div>

          {error && <div className="form-error">{error}</div>}

          <footer className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating…" : "Create key"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
