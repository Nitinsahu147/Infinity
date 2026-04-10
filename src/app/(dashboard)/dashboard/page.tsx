import { auth, currentUser } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLivePanel from "@/components/dashboard-live-panel";
import { Play, RefreshCcw, Users, Activity, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

export default async function DashboardPage() {
  const { userId, orgId } = await auth();
  const user = await currentUser();
  const supabase = await createSupabaseServerClient();

  if (userId && orgId) {
    await supabase.from("profiles").upsert(
      {
        clerk_user_id: userId,
        email: user?.emailAddresses?.[0]?.emailAddress ?? null,
        full_name:
          `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || null,
        org_id: orgId,
      },
      { onConflict: "clerk_user_id" }
    );
  }

  const [
    { count: agentCount },
    { count: profileCount },
    { data: recentAgents },
  ] = await Promise.all([
    supabase.from("agents").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("agents")
      .select("*")
      .order("id", { ascending: false })
      .limit(5),
  ]);

  const displayName =
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    "N/A";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col gap-8 max-w-[1400px]">

      {/* Page header (NexusAI Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-400">
            Real-time metrics for <span className="font-medium text-zinc-300">corp 1</span>
          </p>
        </div>
        
        {/* Mocking Header Buttons from NexusAI Design */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
            <Play size={14} className="text-zinc-400" />
            Simulate Traffic
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
            <RefreshCcw size={14} className="text-zinc-400" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat cards wrapper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "TOTAL AGENTS",
            value: agentCount ?? 0,
            icon: <Activity size={16} />,
            colorClass: "text-sky-400",
            bgClass: "bg-sky-500/10",
            subLabel: "Active platform agents",
            trend: "+12.4% vs last period",
            trendColor: "text-emerald-400",
            trendIcon: "➚"
          },
          {
            label: "TOTAL MEMBERS",
            value: profileCount ?? 0,
            icon: <Users size={16} />,
            colorClass: "text-amber-400",
            bgClass: "bg-amber-500/10",
            subLabel: "Active users in org",
            trend: "+3.1% vs last period",
            trendColor: "text-red-400",
            trendIcon: "➘"
          },
          {
            label: "ACTIVE SESSION",
            value: orgId ? "Yes" : "None",
            icon: <Clock size={16} />,
            colorClass: "text-indigo-400",
            bgClass: "bg-indigo-500/10",
            subLabel: "Authenticated via Clerk",
            trend: "Active now",
            trendColor: "text-emerald-400",
            trendIcon: "➚"
          },
          {
            label: "HEALTH SCORE",
            value: "99.9%",
            icon: <ShieldCheck size={16} />,
            colorClass: "text-emerald-400",
            bgClass: "bg-emerald-500/10",
            subLabel: "Last 30 days uptime",
            trend: "+0.1% vs last period",
            trendColor: "text-emerald-400",
            trendIcon: "➚"
          },
        ].map(({ label, value, icon, colorClass, bgClass, subLabel, trend, trendColor, trendIcon }) => (
          <div
            key={label}
            className="bg-[#111111] border border-zinc-800/60 rounded-xl p-5 flex flex-col gap-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-zinc-500 tracking-wider">
                  {label}
                </span>
                <span className="text-3xl font-semibold text-zinc-100 tracking-tight mt-1">
                  {value}
                </span>
              </div>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${bgClass} ${colorClass}`}
              >
                {icon}
              </div>
            </div>
            
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-[13px] text-zinc-500">{subLabel}</span>
              <span className={`text-[13px] font-medium ${trendColor} flex items-center gap-1`}>
                <span className="text-[10px]">{trendIcon}</span> {trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid wrapper for main content */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          
        {/* Left column: Chart area & DashboardLivePanel */}
        <div className="flex flex-col gap-6">
          {/* Main live panel component (wrapper restyled, internals will manage Recharts) */}
          <div className="bg-[#111111] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2.5">
              <Activity size={16} className="text-zinc-400" />
              <span className="text-sm font-medium text-zinc-200">
                Metrics & Activity
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <div className="p-0">
              <DashboardLivePanel
                initialAgentCount={agentCount ?? 0}
                initialProfileCount={profileCount ?? 0}
                initialRecentAgents={recentAgents ?? []}
              />
            </div>
          </div>
        </div>

        {/* Right column: Session / System Health mockup */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#111111] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-zinc-400" />
              <span className="text-sm font-medium text-zinc-200">System Health</span>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {[
                { name: "API Gateway", latency: "12ms", status: "operational" },
                { name: "Database", latency: "4ms", status: "operational" },
                { name: "Auth Service", latency: "8ms", status: "operational" },
                { name: "Edge Functions", latency: "23ms", status: "operational" },
                { name: "Realtime Engine", latency: "2ms", status: "operational" },
              ].map((s) => (
                <div key={s.name} className="flex flex-row items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-zinc-300">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 font-mono">{s.latency}</span>
                    <span className="text-xs text-emerald-500">{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111111] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2.5">
              <Users size={16} className="text-zinc-400" />
              <span className="text-sm font-medium text-zinc-200">Session Info</span>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                  <span className="text-zinc-300 text-xs font-semibold">{initials}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-200">{displayName}</span>
                  <span className="text-[11px] text-zinc-500">Authenticated via Clerk</span>
                </div>
              </div>
              <div className="h-px bg-zinc-800/50" />
              {[
                { label: "User ID", value: userId ?? "None" },
                { label: "Org ID", value: orgId ?? "None" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <span className="text-[13px] text-zinc-500 shrink-0">{label}</span>
                  <span className="text-[11px] text-zinc-400 font-mono break-all text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}