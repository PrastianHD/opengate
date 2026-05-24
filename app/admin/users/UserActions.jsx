"use client";

import { useState } from "react";
import { useApiAction } from "@/app/components/useApiAction";
import { useConfirm } from "@/app/components/Confirm";
import { useToast } from "@/app/components/Toast";

const ROLES = [
  { value: "user", label: "User", hint: "Default — pay-as-you-go." },
  { value: "reseller", label: "Reseller", hint: "Can issue keys to others." },
  { value: "admin", label: "Admin", hint: "Full access. Be careful." },
];

export default function UserActions({ user }) {
  const { run, busy } = useApiAction();
  const confirm = useConfirm();
  const toast = useToast();

  const [topupOpen, setTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupNote, setTopupNote] = useState("");
  const [topupErr, setTopupErr] = useState(null);

  const [roleOpen, setRoleOpen] = useState(false);
  const [pickedRole, setPickedRole] = useState(user.role);

  const [banOpen, setBanOpen] = useState(false);
  const [banReason, setBanReason] = useState("");

  async function submitTopup(e) {
    e.preventDefault();
    setTopupErr(null);
    const amount = Number(topupAmount);
    if (!Number.isFinite(amount) || amount === 0) {
      setTopupErr("Amount must be a non-zero number");
      return;
    }
    const result = await run(`/api/admin/users/${user.id}/topup`, {
      method: "POST",
      body: {
        amount_usd: amount,
        description: topupNote || "Admin top-up",
      },
      silent: true,
    });
    if (!result.ok) {
      setTopupErr(result.error);
      return;
    }
    setTopupOpen(false);
    setTopupAmount("");
    setTopupNote("");
    toast.success(
      amount > 0
        ? `Topped up ${user.email} with $${amount.toFixed(2)}`
        : `Adjusted ${user.email} by $${amount.toFixed(2)}`
    );
  }

  async function submitRole() {
    if (pickedRole === user.role) {
      setRoleOpen(false);
      return;
    }
    const result = await run(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      body: { role: pickedRole },
    });
    if (result.ok) {
      setRoleOpen(false);
      toast.success(`Role updated to ${pickedRole}`);
    }
  }

  async function unban() {
    const ok = await confirm({
      title: `Unban ${user.email}?`,
      message: "This account will regain full access immediately.",
      confirmLabel: "Unban",
    });
    if (!ok) return;
    const result = await run(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      body: { banned: false },
    });
    if (result.ok) toast.success("User unbanned");
  }

  async function submitBan(e) {
    e.preventDefault();
    if (!banReason.trim()) return;
    const result = await run(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      body: { banned: true, ban_reason: banReason.trim() },
    });
    if (result.ok) {
      setBanOpen(false);
      setBanReason("");
      toast.success(`${user.email} banned`);
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
          onClick={() => {
            setPickedRole(user.role);
            setRoleOpen(true);
          }}
          disabled={busy}
        >
          Role
        </button>
        <button
          type="button"
          className={`key-action ${user.banned_at ? "" : "key-action-danger"}`}
          onClick={() => (user.banned_at ? unban() : setBanOpen(true))}
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

      {roleOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal modal-sm">
            <header className="modal-head">
              <h2>Change role</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setRoleOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </header>
            <div className="modal-body">
              <p className="modal-message">
                Select a role for <strong>{user.email}</strong>.
              </p>
              <div className="role-picker">
                {ROLES.map((r) => (
                  <label key={r.value} className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={pickedRole === r.value}
                      onChange={() => setPickedRole(r.value)}
                    />
                    <span>
                      <strong>{r.label}</strong>
                      <em>{r.hint}</em>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <footer className="modal-foot">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setRoleOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={submitRole}
                disabled={busy}
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </footer>
          </div>
        </div>
      )}

      {banOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal modal-sm">
            <header className="modal-head">
              <h2>Ban user</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setBanOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </header>
            <form onSubmit={submitBan} className="modal-body">
              <p className="modal-message">
                <strong>{user.email}</strong> will lose all access immediately.
                Existing keys keep working but auth will fail.
              </p>
              <label className="form-row">
                <span>Reason</span>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Abuse, fraud, etc"
                  maxLength={500}
                  required
                  autoFocus
                />
              </label>
              <footer className="modal-foot">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setBanOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={busy}
                >
                  {busy ? "Banning…" : "Ban user"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
