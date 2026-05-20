"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateKeyDialog from "./CreateKeyDialog";

export default function KeysToolbar({ availableModels }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [plaintext, setPlaintext] = useState(null);
  const [copied, setCopied] = useState(false);

  function handleCreated(plain) {
    setOpen(false);
    setPlaintext(plain);
    router.refresh();
  }

  async function copy() {
    if (!plaintext) return;
    try {
      await navigator.clipboard.writeText(plaintext);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen(true)}
      >
        + New key
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
            <code>{plaintext}</code>
            <button type="button" className="btn btn-ghost" onClick={copy}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
