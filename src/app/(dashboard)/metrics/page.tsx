"use client";

import { useAuth, useSession } from "@clerk/nextjs";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart2 } from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

type UsageLog = {
  id: number;
  org_id: string;
  api_key_id: number;
  endpoint_name: string;
  status: string;
  created_at: string;
};

type ApiKey = {
  id: number;
  name: string;
};

export default function MetricsPage() {
  const { orgId } = useAuth();
  const { session } = useSession();

  const [token, setToken] = useState<string | null>(null);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  useEffect(() => {
    const loadToken = async () => {
      const t = await session?.getToken();
      setToken(t ?? null);
    };
    loadToken();
  }, [session]);

  const supabase = useMemo(() => {
    return createSupabaseBrowserClient(token ?? undefined);
  }, [token]);

  const refreshData = async () => {
    const [{ data: logs }, { data: keys }] = await Promise.all([
      supabase.from("api_usage_logs").select("*"),
      supabase.from("api_keys").select("id, name"),
    ]);
    setUsageLogs(logs ?? []);
    setApiKeys(keys ?? []);
  };

  useEffect(() => {
    if (!orgId || !token) return;

    refreshData();

    const channel = supabase
      .channel("usage-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "api_usage_logs", filter: `org_id=eq.${orgId}` },
        refreshData
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orgId, token, supabase]);

  // Graph 1: Usage Over Time
  const usageByDate: Record<string, number> = {};
  usageLogs.forEach((log) => {
    const date = log.created_at.slice(0, 10);
    usageByDate[date] = (usageByDate[date] ?? 0) + 1;
  });
  const usageOverTime = Object.entries(usageByDate).map(([date, count]) => ({ date, count }));

  // Graph 2: Usage by Key
  const usageByKey: Record<number, number> = {};
  usageLogs.forEach((log) => {
    usageByKey[log.api_key_id] = (usageByKey[log.api_key_id] ?? 0) + 1;
  });
  const usagePerKey = Object.entries(usageByKey).map(([keyId, count]) => {
    const key = apiKeys.find((k) => k.id === Number(keyId));
    return { name: key?.name ?? `Key ${keyId}`, count };
  });

  // Summary stats
  const totalCalls = usageLogs.length;
  const today = new Date().toISOString().slice(0, 10);
  const todayCalls = usageLogs.filter((l) => l.created_at.slice(0, 10) === today).length;
  const successRate = totalCalls === 0 ? 0 : Math.round(
    (usageLogs.filter((l) => l.status === "success").length / totalCalls) * 100
  );

  const statCards = [
    {
      label: "TOTAL API CALLS",
      value: totalCalls,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      colorClass: "text-indigo-400",
      bgClass: "bg-indigo-500/10",
    },
    {
      label: "TODAY'S CALLS",
      value: todayCalls,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
      ),
      colorClass: "text-sky-400",
      bgClass: "bg-sky-500/10",
    },
    {
      label: "SUCCESS RATE",
      value: `${successRate}%`,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10",
    },
    {
      label: "UNIQUE KEYS USED",
      value: Object.keys(usageByKey).length,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7" cy="17" r="4" /><path d="M10.5 13.5L21 3" /><path d="M19 5l2 2" /><path d="M15 9l2 2" />
        </svg>
      ),
      colorClass: "text-amber-400",
      bgClass: "bg-amber-500/10",
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#1a1a1a] border border-zinc-700/60 rounded-xl px-3 py-2.5 text-xs shadow-xl">
        <p className="text-zinc-400 font-medium mb-1">{label}</p>
        <p className="text-zinc-100 font-semibold">
          {payload[0].value} {payload[0].value === 1 ? "call" : "calls"}
        </p>
      </div>
    );
  };

  const EmptyChart = ({ message }: { message: string }) => (
    <div className="h-[300px] flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-800/60">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
      <p className="text-sm text-zinc-600">{message}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">API Usage Analytics</h1>
          <p className="text-sm text-zinc-400">Real-time metrics for your organisation's API activity.</p>
        </div>

        {/* Live badge */}
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon, colorClass, bgClass }) => (
          <div key={label} className="bg-[#111111] border border-zinc-800/60 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 tracking-wider">{label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bgClass} ${colorClass}`}>
                {icon}
              </div>
            </div>
            <span className="text-3xl font-semibold text-zinc-100 tracking-tight">{value}</span>
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div className="bg-[#111111] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2.5">
          <Activity size={14} className="text-zinc-400" />
          <span className="text-sm font-medium text-zinc-200">API Usage Over Time</span>
          <span className="ml-auto text-xs text-zinc-500">
            {usageOverTime.length} {usageOverTime.length === 1 ? "day" : "days"} of data
          </span>
        </div>
        <div className="p-5">
          {usageOverTime.length === 0 ? (
            <EmptyChart message="No usage data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageOverTime} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={{ fill: "#818cf8", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-[#111111] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2.5">
          <BarChart2 size={14} className="text-zinc-400" />
          <span className="text-sm font-medium text-zinc-200">Usage by API Key</span>
          <span className="ml-auto text-xs text-zinc-500">
            {usagePerKey.length} {usagePerKey.length === 1 ? "key" : "keys"} active
          </span>
        </div>
        <div className="p-5">
          {usagePerKey.length === 0 ? (
            <EmptyChart message="No key usage data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usagePerKey} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="#818cf8"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={56}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}