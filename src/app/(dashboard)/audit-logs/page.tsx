"use client";

import { useAuth, useSession } from "@clerk/nextjs";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

type Log = {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
};

export default function AuditLogsPage() {
  const { orgId, orgRole } = useAuth(); // ✅ orgRole add
  const { session } = useSession();

  const [token, setToken] = useState<string | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);

  const isAdmin = orgRole === "org:admin"; // ✅ role check

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

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .order("id", { ascending: false });

      setLogs(data ?? []);
    };

    if (token && orgId && isAdmin) fetchLogs(); // ✅ admin only fetch
  }, [token, orgId, isAdmin]);

  const format = (d: string) =>
    new Date(d).toISOString().replace("T", " ").slice(0, 19);

  const actionColor = (action: string) => {
    if (action.includes("creat")) return { color: "#059669", bg: "#ecfdf5", border: "#bbf7d0" };
    if (action.includes("delet")) return { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
    if (action.includes("updat") || action.includes("complet")) return { color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
    return { color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" };
  };

  // ✅ MEMBER VIEW (restricted)
  if (!isAdmin) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0 }}>
            Audit Logs
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
            Access restricted to organisation admins.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "20px",
          }}
        >
          <p style={{ fontSize: "14px", color: "#374151", margin: 0 }}>
            Only admins can view audit logs.
          </p>
        </div>
      </div>
    );
  }

  // ✅ ADMIN VIEW (original UI unchanged)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Audit Logs
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
            A full record of actions performed in your organisation.
          </p>
        </div>

        {/* Log count badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            fontSize: "13px",
            color: "#374151",
            fontWeight: 500,
          }}
        >
          {logs.length} {logs.length === 1 ? "entry" : "entries"}
        </div>
      </div>

      {/* Table card (same as your original) */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        {logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            No audit logs yet
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Action", "Entity Type", "Entity ID", "Time"].map((col) => (
                    <th key={col} style={{ padding: "11px 16px", textAlign: "left" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => {
                  const { color, bg, border } = actionColor(log.action);
                  return (
                    <tr key={log.id}>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ color, backgroundColor: bg, border: `1px solid ${border}`, padding: "3px 10px", borderRadius: "99px" }}>
                          {log.action}
                        </span>
                      </td>

                      <td style={{ padding: "12px 16px" }}>{log.entity_type}</td>
                      <td style={{ padding: "12px 16px" }}>{log.entity_id}</td>
                      <td style={{ padding: "12px 16px" }}>{format(log.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}