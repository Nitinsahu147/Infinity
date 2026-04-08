"use client";

import { useAuth, useSession } from "@clerk/nextjs";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function AgentsPage() {
  const { orgId, userId, orgRole } = useAuth();
  const { session } = useSession();

  const [name, setName] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = orgRole === "org:admin";

  const handleInsert = async () => {
    if (!isAdmin) {
      setResult({ error: "Only admins can create agents" });
      return;
    }
    try {
      setLoading(true);
      const token = await session?.getToken();
      const supabase = createSupabaseBrowserClient(token ?? undefined);

      const { data, error } = await supabase
        .from("agents")
        .insert([{ name, org_id: orgId }])
        .select();

      if (error) {
        setResult({ data: null, error });
        return;
      }

      const createdAgent = data?.[0];

      if (createdAgent) {
        const { error: auditError } = await supabase.from("audit_logs").insert([
          {
            org_id: orgId,
            actor_user_id: userId,
            action: "agent_created",
            entity_type: "agent",
            entity_id: String(createdAgent.id),
          },
        ]);
        setResult({ data, error: null, auditError: auditError ?? null });
      } else {
        setResult({ data, error: null });
      }

      setName("");
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  // Non-admin view
  if (!isAdmin) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "640px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
            Agents
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
            Manage your organisation's agents.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
            padding: "20px",
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "14px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "#fef3c7",
              border: "1px solid #fde68a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#92400e", margin: 0 }}>
              Admin access required
            </p>
            <p style={{ fontSize: "13px", color: "#78350f", margin: 0, lineHeight: 1.5 }}>
              Only organisation admins can create and manage agents. Contact your admin to request access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isDisabled = loading || !name || !orgId;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "640px" }}>

      {/* Page header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
          Agents
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
          Create and manage agents for your organisation.
        </p>
      </div>

      {/* Org context badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 14px",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          alignSelf: "flex-start",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: orgId ? "#22c55e" : "#f59e0b",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: "12px", color: "#6b7280" }}>Org:</span>
        <code style={{ fontSize: "12px", color: "#111827", fontFamily: "monospace", fontWeight: 500 }}>
          {orgId ?? "No org selected"}
        </code>
      </div>

      {/* Create agent card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>Create New Agent</span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "10px",
              fontWeight: 600,
              color: "#4f46e5",
              backgroundColor: "#eef2ff",
              border: "1px solid #c7d2fe",
              padding: "2px 7px",
              borderRadius: "4px",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Admin
          </span>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151" }}>
              Agent Name
            </label>
            <input
              type="text"
              placeholder="e.g. Support Bot, Analytics Agent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "9px 12px",
                fontSize: "14px",
                color: "#111827",
                backgroundColor: "#ffffff",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            onClick={handleInsert}
            disabled={isDisabled}
            style={{
              alignSelf: "flex-start",
              padding: "10px 20px",
              borderRadius: "10px",
              backgroundColor: isDisabled ? "#f3f4f6" : "#111827",
              color: isDisabled ? "#9ca3af" : "#ffffff",
              fontSize: "14px",
              fontWeight: 500,
              border: "none",
              cursor: isDisabled ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {loading ? (
              <>
                <svg
                  width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  style={{ animation: "spin 0.8s linear infinite" }}
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Adding...
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Agent
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result card */}
      {result !== null && (
        <div
          style={{
            backgroundColor: "#ffffff",
            border: `1px solid ${result?.error ? "#fecaca" : "#bbf7d0"}`,
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 20px",
              borderBottom: `1px solid ${result?.error ? "#fecaca" : "#bbf7d0"}`,
              backgroundColor: result?.error ? "#fef2f2" : "#f0fdf4",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {result?.error ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            )}
            <span style={{ fontSize: "13px", fontWeight: 600, color: result?.error ? "#991b1b" : "#065f46" }}>
              {result?.error ? "Failed to create agent" : "Agent created successfully"}
            </span>
          </div>

          <div style={{ padding: "16px 20px" }}>
            {result?.error ? (
              <p style={{ fontSize: "13px", color: "#991b1b", margin: 0 }}>
                {typeof result.error === "string" ? result.error : JSON.stringify(result.error)}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {result?.data?.[0] && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {[
                      { label: "Agent ID", value: String(result.data[0].id) },
                      { label: "Name", value: result.data[0].name },
                      { label: "Org ID", value: result.data[0].org_id },
                      { label: "Status", value: result.data[0].status ?? "active" },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "12px", color: "#9ca3af", minWidth: "70px" }}>{label}</span>
                        <code style={{
                          fontSize: "12px",
                          color: "#111827",
                          fontFamily: "monospace",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          padding: "2px 8px",
                        }}>
                          {value}
                        </code>
                      </div>
                    ))}
                  </div>
                )}
                {result?.auditError && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    backgroundColor: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "8px",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span style={{ fontSize: "12px", color: "#92400e" }}>
                      Audit log warning: {result.auditError.message ?? JSON.stringify(result.auditError)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input:focus {
          border-color: #111827 !important;
          box-shadow: 0 0 0 3px rgba(17,24,39,0.08);
        }
      `}</style>
    </div>
  );
}