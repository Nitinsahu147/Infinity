"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Key,
  TerminalSquare,
  Bot,
  FileText,
  Users,
  Sun
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
    label: "Dashboard", // Renamed from Overview to match mock
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

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <aside className="bg-[#0A0A0A] border-r border-zinc-800/60 flex flex-col px-4 py-6 gap-8 sticky top-0 h-screen overflow-y-auto w-[240px]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2">
        <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
          {/* Using a lightning bolt equivalent for NexusAI style */}
          <Activity size={18} className="text-white" />
        </div>
        <span className="text-xl font-bold text-zinc-100 tracking-tight">
          VyorAI
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-3 mb-2">
          Platform
        </p>

        {visibleItems.map(({ href, label, icon, adminOnly }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${isActive
                  ? "bg-zinc-800/60 bg-opacity-50 text-sky-400 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
            >
              <span className={`flex items-center shrink-0 ${isActive ? "text-sky-400" : "text-zinc-500"}`}>
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

      {/* Sidebar footer sections (Theme toggle mock + watermark) */}
      <div className="flex flex-col gap-4">
        {/* Light Mode toggle dummy to match UI mock */}
        <button className="flex items-center gap-3 px-3 text-sm text-zinc-400 hover:text-zinc-200 transition-colors w-full text-left">
          <Sun size={18} className="text-zinc-500" />
          <span>Light Mode</span>
        </button>

        <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 mt-2">
          <p className="text-[10px] text-zinc-500 mb-1 tracking-wide uppercase">Powered by</p>
          <p className="text-xs font-medium text-zinc-300">
            Clerk &middot; Supabase
          </p>
        </div>
      </div>
    </aside>
  );
}