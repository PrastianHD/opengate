"use client";

// Combined client-side providers wrapper. Mount once near the root layout
// so any client component can use useToast/useConfirm without per-page setup.

import { ConfirmProvider } from "./Confirm";
import { ToastProvider } from "./Toast";

export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </ToastProvider>
  );
}
