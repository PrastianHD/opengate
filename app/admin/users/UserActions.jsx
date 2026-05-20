"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserActions({ user }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupNote, setTopupNote] = useState("");
  const [topupErr, setTopupErr] = useState(null);

  async function patch(body) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
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

  async function submitTopup(e) {
    e.preventDefault();
    setTopupErr(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_usd: Number(topupAmount),
          description: topupNote || "Admin top-up",
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error?.message || "Top-up failed");
      setTopupOpen(false);
      setTopupAmount("");
      setTopupNote("");
      router.refresh();
    } catch (e) {
      setTopupErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function changeRole() {
    const next = prompt(
      `Change role for ${user.email}\nCurrent: ${user.role}\nEnter: user, reseller, admin`,
      user.role
    );
    if (!next || next === user.role) return;
    if (!["user", "reseller", "admin"].includes(next)) {
      alert("Invalid role");
      return;
    }
    await patch({ role: next });
  }

  async function toggleBan() {
    if (user.banned_at) {
      if (!confirm(`Unban ${user.email}?`)) return;
      await patch({ banned: false });
    } else {
      const reason = prompt(`Ban ${user.email}\nReason:`, "Abuse");
      if (!reason) return;
      await patch({ banned: true, ban_reason: reason });
    }
  }

  return (
    <>
      <div className="key-actions">
        <button
          type="button"
          className="key-action"
          onClick={() => setTopupOpen(true)}
          disabled={busy}
        >
          Top up
        </button>
        <button
          type="button"
          className="key-action"
          onClick={changeRole}
          disabled={busy}
        >
          Role
        </button>
        <button
          type="button"
          className={`key-action ${user.banned_at ? "" : "key-action-danger"}`}
          onClick={toggleBan}
          disabled={busy}
        >
          {user.banned_at ? "Unban" : "Ban"}
        </button>
      </div>

      {topupOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <header className="modal-head">
              <h2>Top up {user.email}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setTopupOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </header>
            <form onSubmit={submitTopup} className="modal-body">
              <label className="form-row">
                <span>Amount USD (negative to deduct)</span>
                <input
                  type="number"
                  step={0.01}
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="5.00"
                  required
                  autoFocus
                />
              </label>
              <label className="form-row">
                <span>Note (optional)</span>
                <input
                  type="text"
                  value={topupNote}
                  onChange={(e) => setTopupNote(e.target.value)}
                  placeholder="Telegram payment 2026-05-20"
                  maxLength={200}
                />
              </label>
              {topupErr && <div className="form-error">{topupErr}</div>}
              <footer className="modal-foot">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setTopupOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={busy}
                >
                  {busy ? "Processing…" : "Apply"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
