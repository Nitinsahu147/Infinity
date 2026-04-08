"use client";

import { useAuth, useSession } from "@clerk/nextjs";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

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
      label: "Total API Calls",
      value: totalCalls,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      accent: "#4f46e5", bg: "#eef2ff",
    },
    {
      label: "Today's Calls",
      value: todayCalls,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
      ),
      accent: "#0891b2", bg: "#ecfeff",
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      accent: "#059669", bg: "#ecfdf5",
    },
    {
      label: "Unique Keys Used",
      value: Object.keys(usageByKey).length,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7" cy="17" r="4"/><path d="M10.5 13.5L21 3"/><path d="M19 5l2 2"/><path d="M15 9l2 2"/>
        </svg>
      ),
      accent: "#d97706", bg: "#fffbeb",
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "10px 14px",
        fontSize: "13px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
      }}>
        <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontWeight: 500 }}>{label}</p>
        <p style={{ margin: 0, color: "#111827", fontWeight: 600 }}>
          {payload[0].value} {payload[0].value === 1 ? "call" : "calls"}
        </p>
      </div>
    );
  };

  const EmptyChart = ({ message }: { message: string }) => (
    <div style={{
      height: "300px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      backgroundColor: "#f9fafb",
      borderRadius: "10px",
      border: "1px dashed #e5e7eb",
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>{message}</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
            API Usage Analytics
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
            Real-time metrics for your organisation's API activity.
          </p>
        </div>

        {/* Live badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "6px 12px", borderRadius: "8px",
          backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
          fontSize: "12px", color: "#059669", fontWeight: 500,
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block" }} />
          Live
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
        {statCards.map(({ label, value, icon, accent, bg }) => (
          <div key={label} style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>{label}</span>
              <div style={{
                width: "30px", height: "30px", borderRadius: "8px",
                backgroundColor: bg, color: accent,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {icon}
              </div>
            </div>
            <span style={{ fontSize: "26px", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", lineHeight: 1 }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>API Usage Over Time</span>
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "#9ca3af" }}>
            {usageOverTime.length} {usageOverTime.length === 1 ? "day" : "days"} of data
          </span>
        </div>
        <div style={{ padding: "20px" }}>
          {usageOverTime.length === 0 ? (
            <EmptyChart message="No usage data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageOverTime} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ fill: "#4f46e5", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>Usage by API Key</span>
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "#9ca3af" }}>
            {usagePerKey.length} {usagePerKey.length === 1 ? "key" : "keys"} active
          </span>
        </div>
        <div style={{ padding: "20px" }}>
          {usagePerKey.length === 0 ? (
            <EmptyChart message="No key usage data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usagePerKey} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="#4f46e5"
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