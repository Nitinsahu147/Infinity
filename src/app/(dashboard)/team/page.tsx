"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

export default function TeamPage() {
  const { orgRole } = useAuth();

  const [emailAddress, setEmailAddress] = useState("");
  const [role, setRole] = useState<"org:member" | "org:admin">("org:member");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = orgRole === "org:admin";
  const isDisabled = loading || !emailAddress;

  const handleInvite = async () => {
    if (!isAdmin) {
      setResult({ error: "Only admins can invite members." });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/org/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress, role }),
      });

      const data = await res.json();
      setResult(data);

      if (data.success) {
        setEmailAddress("");
        setRole("org:member");
      }
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "640px" }}>
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
            Team
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
            Team management is restricted to organisation admins.
          </p>
        </div>

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
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
              Access Restricted
            </span>
          </div>

          <div style={{ padding: "20px" }}>
            <p style={{ fontSize: "14px", color: "#374151", margin: 0 }}>
              Only admins can invite and manage team members.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "640px" }}>
      {/* Page header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
          Team
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
          Invite members to collaborate in your organisation.
        </p>
      </div>

      {/* Invite card */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>Invite Member</span>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Email input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151" }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="colleague@company.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
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

          {/* Role select */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151" }}>
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "org:member" | "org:admin")}
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
            >
              <option value="org:member">Member</option>
              <option value="org:admin">Admin</option>
            </select>

            {/* Role description */}
            <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
              {role === "org:admin"
                ? "Admins can manage members, API keys, and org settings."
                : "Members can access the dashboard and use API keys."}
            </p>
          </div>

          {/* Submit button */}
          <button
            onClick={handleInvite}
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
                Sending...
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Send Invite
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result card — only shown after an attempt */}
      {result !== null && (
        <div style={{
          backgroundColor: "#ffffff",
          border: `1px solid ${result?.error ? "#fecaca" : "#bbf7d0"}`,
          borderRadius: "14px",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${result?.error ? "#fecaca" : "#bbf7d0"}`,
            backgroundColor: result?.error ? "#fef2f2" : "#f0fdf4",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
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
              {result?.error ? "Invite Failed" : "Invite Sent Successfully"}
            </span>
          </div>

          <div style={{ padding: "16px 20px" }}>
            {result?.error ? (
              <p style={{ fontSize: "13px", color: "#991b1b", margin: 0 }}>
                {result.error}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {result?.invitationId && (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "12px", color: "#9ca3af", minWidth: "100px" }}>Invitation ID</span>
                    <code style={{
                      fontSize: "12px",
                      color: "#111827",
                      fontFamily: "monospace",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      padding: "2px 8px",
                    }}>
                      {result.invitationId}
                    </code>
                  </div>
                )}
                <p style={{ fontSize: "13px", color: "#374151", margin: 0 }}>
                  An invitation email has been sent. They'll be able to join your organisation once they accept.
                </p>
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
        input:focus, select:focus {
          border-color: #111827 !important;
          box-shadow: 0 0 0 3px rgba(17,24,39,0.08);
        }
      `}</style>
    </div>
  );
}