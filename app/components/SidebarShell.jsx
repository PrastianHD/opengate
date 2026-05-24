"use client";

// SidebarShell — wraps the dashboard/admin layout shell with collapse state
// persisted to localStorage. Server components compose static content as
// children, then drop in <SidebarCollapseButton /> wherever the toggle
// should render (next to the brand, typically).

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "opengate.sidebar.collapsed";

const SidebarContext = createContext({
  collapsed: false,
  toggle: () => {},
});

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
        // ignore quota / privacy errors
      }
      return next;
    });
  }

  const isCollapsed = collapsed && hydrated;

  return (
    <SidebarContext.Provider value={{ collapsed: isCollapsed, toggle }}>
      <section
        className={`dashboard-shell${isCollapsed ? " is-collapsed" : ""}`}
      >
        <aside className="dashboard-side" aria-label={ariaLabel}>
          {side}
        </aside>
        <div className="dashboard-main">{children}</div>
      </section>
    </SidebarContext.Provider>
  );
}

export function SidebarCollapseButton() {
  const { collapsed, toggle } = useContext(SidebarContext);
  return (
    <button
      type="button"
      className="sidebar-collapse-btn"
      onClick={toggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-pressed={collapsed}
    >
      {collapsed ? "›" : "‹"}
    </button>
  );
}
