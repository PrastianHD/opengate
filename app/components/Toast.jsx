"use client";

// Toast system. Stack of dismissable alerts in a portal.
// Use via useToast() hook anywhere under <ToastProvider>.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

const DEFAULT_DURATION = 4500;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = ++idRef.current;
      const next = {
        id,
        kind: toast.kind || "info",
        title: toast.title,
        message: toast.message,
        action: toast.action,
        duration: toast.duration ?? DEFAULT_DURATION,
      };
      setToasts((t) => [...t, next]);
      if (next.duration > 0) {
        setTimeout(() => dismiss(id), next.duration);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toast: push,
      success: (msg, opts) => push({ kind: "success", message: msg, ...opts }),
      error: (msg, opts) => push({ kind: "error", message: msg, ...opts }),
      info: (msg, opts) => push({ kind: "info", message: msg, ...opts }),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="toast-viewport"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { kind, title, message, action } = toast;
  const icon = kind === "success" ? "✓" : kind === "error" ? "✕" : "ℹ";

  // Late-mount fade-in: push initial transform so the entry transition fires.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(r);
  }, []);

  return (
    <div
      className={`toast toast-${kind}${mounted ? " toast-in" : ""}`}
      role={kind === "error" ? "alert" : "status"}
    >
      <span className="toast-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="toast-body">
        {title && <strong>{title}</strong>}
        <span>{message}</span>
      </div>
      {action && (
        <button type="button" className="toast-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      <button
        type="button"
        className="toast-close"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}
