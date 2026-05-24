"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/Toast";
import CreateKeyDialog from "./CreateKeyDialog";

export default function KeysToolbar({ availableModels, variant = "default" }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [plaintext, setPlaintext] = useState(null);
  const [revealed, setRevealed] = useState(false);

  function handleCreated(plain) {
    setOpen(false);
    setPlaintext(plain);
    setRevealed(true);
    router.refresh();
    toast.success("API key created");
  }

  async function copy() {
    if (!plaintext) return;
    try {
      await navigator.clipboard.writeText(plaintext);
      toast.success("Token copied to clipboard");
    } catch {
      toast.error("Couldn't copy. Select the token manually.");
    }
  }

  function maskToken(t) {
    if (!t) return "";
    return `${t.slice(0, 8)}${"•".repeat(Math.max(0, t.length - 12))}${t.slice(-4)}`;
  }

  return (
    <>
      <button
        type="button"
        className={variant === "empty" ? "btn btn-primary" : "btn btn-primary"}
        onClick={() => setOpen(true)}
      >
        + {variant === "empty" ? "Create your first key" : "New key"}
      </button>

      <CreateKeyDialog
        open={open}
        availableModels={availableModels}
        onClose={() => setOpen(false)}
        onCreated={handleCreated}
      />

      {plaintext && (
        <div className="key-banner" role="status">
          <div className="key-banner-head">
            <strong>Save your new API key</strong>
            <button
              type="button"
              className="modal-close"
              onClick={() => setPlaintext(null)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
          <p className="key-banner-warn">
            This is the only time the full token is shown. Store it in a
            password manager or your client config now.
          </p>
          <div className="key-banner-token">
            <code aria-label={revealed ? "API token, fully visible" : "API token, masked"}>
              {revealed ? plaintext : maskToken(plaintext)}
            </code>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setRevealed((v) => !v)}
              aria-pressed={revealed}
            >
              {revealed ? "Hide" : "Reveal"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={copy}>
              Copy
            </button>
          </div>
        </div>
      )}
    </>
  );
}
