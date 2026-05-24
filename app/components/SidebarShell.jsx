"use client";

// SidebarShell — wraps the dashboard/admin layout shell with collapse state
// persisted to localStorage. Server components compose static content inside.

import { useEffect, useState } from "react";

const STORAGE_KEY = "opengate.sidebar.collapsed";

export default function SidebarShell({ children, side, ariaLabel }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      setCollapsed(v === "1");
    } catch {
      // localStorage blocked (private mode) — fall back to default expanded.
    }
    setHydrated(true);
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore quota / privacy errors — visual state still flips
      }
      return next;
    });
  }

  return (
    <section
      className={`dashboard-shell${collapsed && hydrated ? " is-collapsed" : ""}`}
    >
      <aside className="dashboard-side" aria-label={ariaLabel}>
        {side({
          collapseButton: (
            <button
              type="button"
              className="sidebar-collapse-btn"
              onClick={toggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={collapsed}
            >
              {collapsed ? "›" : "‹"}
            </button>
          ),
          collapsed: collapsed && hydrated,
        })}
      </aside>
      <div className="dashboard-main">{children}</div>
    </section>
  );
}
