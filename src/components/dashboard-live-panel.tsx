"use client";

import { useAuth, useSession } from "@clerk/nextjs";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

type AgentRow = {
  id: number;
  org_id: string;
  name: string;
  status: string;
  created_at: string;
};

type UsageLogRow = {
  id: number;
  org_id: string;
  api_key_id: number;
  endpoint_name: string;
  status: string;
  created_at: string;
};

type ApiKeyRow = {
  id: number;
  name: string;
  status: string;
};

type Props = {
  initialAgentCount: number;
  initialProfileCount: number;
  initialRecentAgents: AgentRow[];
};

export default function DashboardLivePanel({
  initialAgentCount,
  initialProfileCount,
  initialRecentAgents,
}: Props) {
  const { orgId } = useAuth();
  const { session } = useSession();

  const [token, setToken] = useState<string | null>(null);
  const [agentCount, setAgentCount] = useState(initialAgentCount);
  const [profileCount] = useState(initialProfileCount);
  const [recentAgents, setRecentAgents] = useState<AgentRow[]>(initialRecentAgents);
  const [usageLogs, setUsageLogs] = useState<UsageLogRow[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyRow[]>([]);
  const [totalCalls, setTotalCalls] = useState(0);
  const [todayCalls, setTodayCalls] = useState(0);
  const [mostUsedKeyName, setMostUsedKeyName] = useState("N/A");

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

  const refreshDashboardData = async () => {
    const [
      { count: newAgentCount },
      { data: newRecentAgents },
      { data: logs },
      { data: keys },
    ] = await Promise.all([
      supabase.from("agents").select("*", { count: "exact", head: true }),
      supabase.from("agents").select("*").order("id", { ascending: false }).limit(5),
      supabase.from("api_usage_logs").select("*").order("id", { ascending: false }),
      supabase.from("api_keys").select("id, name, status"),
    ]);

    const usage = logs ?? [];
    const keyRows = keys ?? [];

    setAgentCount(newAgentCount ?? 0);
    setRecentAgents(newRecentAgents ?? []);
    setUsageLogs(usage);
    setApiKeys(keyRows);
    setTotalCalls(usage.length);

    const today = new Date().toISOString().slice(0, 10);
    const todayCount = usage.filter(
      (log) => log.created_at.slice(0, 10) === today
    ).length;
    setTodayCalls(todayCount);

    const usageByKey: Record<number, number> = {};
    for (const log of usage) {
      usageByKey[log.api_key_id] = (usageByKey[log.api_key_id] ?? 0) + 1;
    }

    let topKeyId: number | null = null;
    let topCount = 0;
    for (const [keyIdStr, count] of Object.entries(usageByKey)) {
      if (count > topCount) {
        topCount = count;
        topKeyId = Number(keyIdStr);
      }
    }

    const topKey = keyRows.find((k) => k.id === topKeyId);
    setMostUsedKeyName(topKey?.name ?? "N/A");
  };

  useEffect(() => {
    if (!orgId || !token) return;

    refreshDashboardData();

    const agentsChannel = supabase
      .channel(`dashboard-agents-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agents", filter: `org_id=eq.${orgId}` },
        async () => { await refreshDashboardData(); }
      )
      .subscribe();

    const usageChannel = supabase
      .channel(`dashboard-usage-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "api_usage_logs", filter: `org_id=eq.${orgId}` },
        async () => { await refreshDashboardData(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(agentsChannel);
      supabase.removeChannel(usageChannel);
    };
  }, [orgId, token, supabase]);

  const formatDate = (value: string) =>
    new Date(value).toISOString().replace("T", " ").slice(0, 19);

  const getKeyName = (keyId: number) =>
    apiKeys.find((k) => k.id === keyId)?.name ?? `Key #${keyId}`;

  const statusColor = (status: string) => {
    if (status === "active" || status === "success") return "#059669";
    if (status === "inactive" || status === "error") return "#dc2626";
    return "#6b7280";
  };

  const statCards = [
    {
      label: "Profiles",
      value: profileCount,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      accent: "#4f46e5",
      bg: "#eef2ff",
    },
    {
      label: "Agents",
      value: agentCount,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      ),
      accent: "#0891b2",
      bg: "#ecfeff",
    },
    {
      label: "Total API Calls",
      value: totalCalls,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      accent: "#d97706",
      bg: "#fffbeb",
    },
    {
      label: "Today's Calls",
      value: todayCalls,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
      ),
      accent: "#059669",
      bg: "#ecfdf5",
    },
    {
      label: "Most Used Key",
      value: mostUsedKeyName,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7" cy="17" r="4"/><path d="M10.5 13.5L21 3"/><path d="M19 5l2 2"/><path d="M15 9l2 2"/>
        </svg>
      ),
      accent: "#7c3aed",
      bg: "#f5f3ff",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
        }}
      >
        {statCards.map(({ label, value, icon, accent, bg }) => (
          <div
            key={label}
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>{label}</span>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "7px",
                  backgroundColor: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: accent,
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
            </div>
            <span
              style={{
                fontSize: typeof value === "string" ? "15px" : "24px",
                fontWeight: 700,
                color: "#111827",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                wordBreak: "break-word",
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Recent panels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Recent Agents */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #f3f4f6",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>Recent Agents</span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "11px",
                color: "#6b7280",
                backgroundColor: "#f3f4f6",
                padding: "2px 8px",
                borderRadius: "99px",
              }}
            >
              {recentAgents.length} shown
            </span>
          </div>

          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {recentAgents.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#9ca3af", padding: "8px 4px", margin: 0 }}>
                No agents yet.
              </p>
            ) : (
              recentAgents.map((agent) => (
                <div
                  key={agent.id}
                  style={{
                    border: "1px solid #f3f4f6",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                      {agent.name}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: statusColor(agent.status),
                        backgroundColor: agent.status === "active" ? "#ecfdf5" : "#f9fafb",
                        border: `1px solid ${agent.status === "active" ? "#bbf7d0" : "#e5e7eb"}`,
                        padding: "2px 8px",
                        borderRadius: "99px",
                        flexShrink: 0,
                      }}
                    >
                      {agent.status}
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", color: "#9ca3af", fontFamily: "monospace" }}>
                    {formatDate(agent.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent API Usage */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #f3f4f6",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>Recent API Usage</span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "11px",
                color: "#6b7280",
                backgroundColor: "#f3f4f6",
                padding: "2px 8px",
                borderRadius: "99px",
              }}
            >
              {Math.min(usageLogs.length, 5)} shown
            </span>
          </div>

          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {usageLogs.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#9ca3af", padding: "8px 4px", margin: 0 }}>
                No usage yet.
              </p>
            ) : (
              usageLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  style={{
                    border: "1px solid #f3f4f6",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                      {getKeyName(log.api_key_id)}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: statusColor(log.status),
                        backgroundColor: log.status === "success" ? "#ecfdf5" : "#fef2f2",
                        border: `1px solid ${log.status === "success" ? "#bbf7d0" : "#fecaca"}`,
                        padding: "2px 8px",
                        borderRadius: "99px",
                        flexShrink: 0,
                      }}
                    >
                      {log.status}
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#374151" }}>
                    {log.endpoint_name}
                  </span>
                  <span style={{ fontSize: "11px", color: "#9ca3af", fontFamily: "monospace" }}>
                    {formatDate(log.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}