"use client";

import SideNav from "../components/SideNav";

const NAV = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/keys", label: "API Keys" },
  { href: "/dashboard/usage", label: "Usage" },
  { href: "/dashboard/billing", label: "Billing" },
];

export default function DashboardNav() {
  return <SideNav items={NAV} ariaLabel="Dashboard navigation" />;
}
