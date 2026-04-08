"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  adminOnly?: boolean;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: "/metrics",
    label: "Metrics",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    href: "/api-keys",
    label: "API Keys",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="17" r="4"/><path d="M10.5 13.5L21 3"/><path d="M19 5l2 2"/><path d="M15 9l2 2"/>
      </svg>
    ),
  },
  {
    href: "/api-keys/test",
    label: "Test API Key",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
  {
    href: "/agents",
    label: "Agents",
    adminOnly: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
  {
    href: "/audit-logs",
    label: "Audit Logs",
    adminOnly: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="8" y1="13" x2="16" y2="13"/>
        <line x1="8" y1="17" x2="16" y2="17"/>
      </svg>
    ),
  },
  {
    href: "/team",
    label: "Team",
    adminOnly: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
];

export function DashboardSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <aside
      style={{
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        gap: "32px",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 8px" }}>
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            backgroundColor: "#111827",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>D</span>
        </div>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>
          DevDash
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
        <p
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "#9ca3af",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "0 10px",
            margin: "0 0 6px 0",
          }}
        >
          Navigation
        </p>

        {visibleItems.map(({ href, label, icon, adminOnly }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 10px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#111827" : "#374151",
                textDecoration: "none",
                backgroundColor: isActive ? "#f3f4f6" : "transparent",
                borderLeft: isActive ? "2px solid #111827" : "2px solid transparent",
              }}
            >
              <span
                style={{
                  color: isActive ? "#111827" : "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                {icon}
              </span>
              <span style={{ flex: 1 }}>{label}</span>
              {adminOnly && isAdmin && (
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 600,
                    color: "#4f46e5",
                    backgroundColor: "#eef2ff",
                    border: "1px solid #c7d2fe",
                    padding: "1px 5px",
                    borderRadius: "4px",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  Admin
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar footer */}
      <div
        style={{
          padding: "12px 10px",
          borderRadius: "10px",
          backgroundColor: "#f8fafc",
          border: "1px solid #e5e7eb",
        }}
      >
        <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 2px 0" }}>Powered by</p>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: 0, fontWeight: 500 }}>
          Clerk · Supabase
        </p>
      </div>
    </aside>
  );
}