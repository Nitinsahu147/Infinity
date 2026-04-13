"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, OrganizationSwitcher } from "@clerk/nextjs";
import { useThemeStore } from "@/store/useThemeStore";
import {
  LayoutDashboard,
  Activity,
  Key,
  TerminalSquare,
  Bot,
  FileText,
  Users,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  adminOnly?: boolean;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    href: "/metrics",
    label: "Metrics",
    icon: <Activity size={18} />,
  },
  {
    href: "/api-keys",
    label: "API Keys",
    icon: <Key size={18} />,
  },
  {
    href: "/api-keys/test",
    label: "Test API Key",
    icon: <TerminalSquare size={18} />,
  },
  {
    href: "/agents",
    label: "Agents",
    adminOnly: true,
    icon: <Bot size={18} />,
  },
  {
    href: "/audit-logs",
    label: "Audit Logs",
    adminOnly: true,
    icon: <FileText size={18} />,
  },
  {
    href: "/team",
    label: "Team",
    adminOnly: true,
    icon: <Users size={18} />,
  },
];

export function DashboardSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { theme, toggleTheme } = useThemeStore();

  // Apply persisted theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("vyorai-theme");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.theme === "light") {
          document.documentElement.classList.add("light-mode");
        } else {
          document.documentElement.classList.remove("light-mode");
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const isDark = theme === "dark";

  return (
    <aside className="bg-[#0A0A0A] border-r border-zinc-800/60 flex flex-col px-4 py-6 gap-6 sticky top-0 h-screen w-[240px]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
          <Activity size={18} className="text-white" />
        </div>
        <span className="text-xl font-bold text-zinc-100 tracking-tight">
          VyorAI
        </span>
      </div>

      {/* Nav — fills remaining space */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-3 mb-2">
          Platform
        </p>

        {visibleItems.map(({ href, label, icon, adminOnly }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? "bg-zinc-800/60 text-sky-400 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <span
                className={`flex items-center shrink-0 ${
                  isActive ? "text-sky-400" : "text-zinc-500"
                }`}
              >
                {icon}
              </span>
              <span className="flex-1">{label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.6)]" />
              )}
              {adminOnly && isAdmin && (
                <span className="text-[9px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded tracking-wide uppercase">
                  Admin
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Sidebar Footer ── */}
      <div className="flex flex-col gap-3 shrink-0 border-t border-zinc-800/60 pt-4">

        {/* Organization Switcher (moved from header) */}
        <div className="px-1">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-2 mb-2">
            Organisation
          </p>
          <OrganizationSwitcher
            appearance={{
              elements: {
                rootBox: { width: "100%" },
                organizationSwitcherTrigger: {
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(63,63,70,0.5)",
                  background: "rgba(24,24,27,0.5)",
                  color: "#e4e4e7",
                  fontSize: "13px",
                  justifyContent: "flex-start",
                  gap: "8px",
                },
                organizationSwitcherTriggerIcon: { color: "#71717a" },
                organizationSwitcherPopoverCard: { background: "#111111", border: "1px solid #27272a" },
                organizationPreviewTextContainer: { color: "#e4e4e7" },
                organizationPreviewSecondaryIdentifier: { color: "#71717a" },
              },
            }}
          />
        </div>

        <div className="h-px bg-zinc-800/60" />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-all w-full text-left group"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <Sun size={17} className="text-zinc-500 group-hover:text-amber-400 transition-colors" />
          ) : (
            <Moon size={17} className="text-zinc-500 group-hover:text-sky-400 transition-colors" />
          )}
          <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          {/* Active indicator pill */}
          <span
            className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase border ${
              isDark
                ? "text-zinc-500 bg-zinc-900 border-zinc-800"
                : "text-amber-400 bg-amber-500/10 border-amber-500/20"
            }`}
          >
            {isDark ? "Dark" : "Light"}
          </span>
        </button>

        {/* Sign Out */}
        <button
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all w-full text-left group"
          aria-label="Sign out"
        >
          <LogOut size={17} className="text-zinc-600 group-hover:text-red-400 transition-colors" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}