"use client";

// useApiAction — small helper that handles the boilerplate every admin/keys
// row component duplicates: busy flag, JSON fetch, error surfacing via toast,
// and router.refresh() on success.
//
// Usage:
//   const { run, busy } = useApiAction();
//   await run(`/api/keys/${id}`, { method: "PATCH", body: { enabled: true } });

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";

export function useApiAction() {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (url, { method = "GET", body, refresh = true, silent = false } = {}) => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch(url, {
          method,
          headers: body ? { "Content-Type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = json?.error?.message || `Request failed (${res.status})`;
          setError(msg);
          if (!silent) toast.error(msg);
          return { ok: false, error: msg, json };
        }
        if (refresh) router.refresh();
        return { ok: true, json };
      } catch (e) {
        setError(e.message);
        if (!silent) toast.error(e.message || "Network error");
        return { ok: false, error: e.message };
      } finally {
        setBusy(false);
      }
    },
    [router, toast]
  );

  return { run, busy, error, setError };
}
