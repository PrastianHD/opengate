"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddUpstreamKeyDialog({ providers, open, onClose }) {
  const router = useRouter();
  const [providerId, setProviderId] = useState(providers[0]?.id || "");
  const [label, setLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [priority, setPriority] = useState(100);
  const [weight, setWeight] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/upstream-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_id: providerId,
          label,
          api_key: apiKey,
          priority,
          weight,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error?.message || "Insert failed");
      onClose();
      router.refresh();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal-head">
          <h2>Add upstream key</h2>
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
            <span>Provider</span>
            <select
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className="form-select"
              required
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-row">
            <span>Label</span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              maxLength={60}
              placeholder="Main account"
            />
          </label>

          <label className="form-row">
            <span>API key (plaintext)</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              placeholder="sk-..."
              autoComplete="off"
            />
            <span className="form-hint">
              Encrypted with AES-256-GCM before storage. Plaintext is never
              returned by the API.
            </span>
          </label>

          <div className="form-grid">
            <label className="form-row">
              <span>Priority (lower = preferred)</span>
              <input
                type="number"
                min={0}
                max={1000}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />
            </label>
            <label className="form-row">
              <span>Weight (within priority bucket)</span>
              <input
                type="number"
                min={1}
                max={100}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </label>
          </div>

          {error && <div className="form-error">{error}</div>}

          <footer className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Saving…" : "Add key"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
