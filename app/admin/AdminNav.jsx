"use client";

import SideNav from "../components/SideNav";

const NAV = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/providers", label: "Providers" },
  { href: "/admin/models", label: "Models" },
];

export default function AdminNav() {
  return <SideNav items={NAV} ariaLabel="Admin navigation" />;
}
