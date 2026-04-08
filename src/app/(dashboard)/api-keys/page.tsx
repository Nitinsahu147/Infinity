"use client";

import { useAuth, useSession, useReverification } from "@clerk/nextjs";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

type ApiKeyRow = {
  id: number;
  org_id: string;
  name: string;
  key_prefix: string;
  key_type: "secret" | "publishable" | "restricted";
  status: string;
  grace_until: string | null;
  created_at: string;
  rotated_from_key_id?: number | null;
  replaced_by_key_id?: number | null;
};

export default function ApiKeysPage() {
  const { orgId, orgRole } = useAuth();
  const { session } = useSession();

  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [keyType, setKeyType] = useState<"secret" | "publishable" | "restricted">("secret");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [rotatingId, setRotatingId] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const isAdmin = orgRole === "org:admin";

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

  const fetchKeys = async () => {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setResult({ error: error.message });
      return;
    }
    setKeys(data ?? []);
  };

  useEffect(() => {
    if (token && orgId) fetchKeys();
  }, [token, orgId]);

  const handleCreateKey = async () => {
    if (!isAdmin) {
      setResult({ error: "Only admins can create API keys." });
      return;
    }

    try {
      setLoading(true);
      setCreatedKey(null);
      const res = await fetch("/api/api-keys/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, keyType }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setCreatedKey(data.key);
        setName("");
        setKeyType("secret");
        await fetchKeys();
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const performRevokeKey = async (keyId: number) => {
    try {
      setRevokingId(keyId);
      const res = await fetch("/api/api-keys/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) await fetchKeys();
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Something went wrong" });
    } finally {
      setRevokingId(null);
    }
  };

  const performRotateKey = async (keyId: number) => {
    try {
      setRotatingId(keyId);
      setCreatedKey(null);
      const res = await fetch("/api/api-keys/rotate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId, graceHours: 48 }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setCreatedKey(data.key);
        await fetchKeys();
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Something went wrong" });
    } finally {
      setRotatingId(null);
    }
  };

  const handleRevokeWithReverification = useReverification(
    async (keyId: number) => { await performRevokeKey(keyId); }
  );

  const handleRotateWithReverification = useReverification(
    async (keyId: number) => { await performRotateKey(keyId); }
  );

  const handleRevokeKey = async (keyId: number) => {
    if (!isAdmin) {
      setResult({ error: "Only admins can revoke API keys." });
      return;
    }

    try {
      await handleRevokeWithReverification(keyId);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Reverification cancelled or failed" });
    }
  };

  const handleRotateKey = async (keyId: number) => {
    if (!isAdmin) {
      setResult({ error: "Only admins can rotate API keys." });
      return;
    }

    try {
      await handleRotateWithReverification(keyId);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Reverification cancelled or failed" });
    }
  };

  const formatDate = (value: string | null) => {
    if (!value) return "N/A";
    return new Date(value).toISOString().replace("T", " ").slice(0, 19);
  };

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusStyle = (status: string) => {
    if (status === "active") return { color: "#059669", bg: "#ecfdf5", border: "#bbf7d0" };
    if (status === "grace_period") return { color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
    if (status === "revoked") return { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
    return { color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" };
  };

  const keyTypeStyle = (type: string) => {
    if (type === "secret") return { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" };
    if (type === "publishable") return { color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" };
    return { color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" };
  };

  const isCreateDisabled = loading || !name || !orgId;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "860px" }}>
      {/* Page header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
          API Keys
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
          {isAdmin
            ? "Create and manage API keys for your organisation."
            : "View your organisation's API keys and use them in read-only mode."}
        </p>
      </div>

      {/* Create key card / member notice */}
      {isAdmin ? (
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="17" r="4"/><path d="M10.5 13.5L21 3"/><path d="M19 5l2 2"/><path d="M15 9l2 2"/>
            </svg>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>Create New Key</span>
          </div>

          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151" }}>Key Name</label>
              <input
                type="text"
                placeholder="e.g. Production Key"
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

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151" }}>Key Type</label>
              <select
                value={keyType}
                onChange={(e) => setKeyType(e.target.value as "secret" | "publishable" | "restricted")}
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
                <option value="secret">Secret Key</option>
                <option value="publishable">Publishable Key</option>
                <option value="restricted">Restricted Key</option>
              </select>
            </div>

            <button
              onClick={handleCreateKey}
              disabled={isCreateDisabled}
              style={{
                alignSelf: "flex-start",
                padding: "10px 20px",
                borderRadius: "10px",
                backgroundColor: isCreateDisabled ? "#f3f4f6" : "#111827",
                color: isCreateDisabled ? "#9ca3af" : "#ffffff",
                fontSize: "14px",
                fontWeight: 500,
                border: "none",
                cursor: isCreateDisabled ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {loading ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ animation: "spin 0.8s linear infinite" }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Creating...
                </>
              ) : "Create API Key"}
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>Read-only Access</span>
          </div>

          <div style={{ padding: "20px" }}>
            <p style={{ fontSize: "14px", color: "#374151", margin: 0 }}>
              Members can view and use API keys, but cannot create, rotate, or revoke them.
            </p>
          </div>
        </div>
      )}

      {/* Created key banner */}
      {createdKey && (
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #fde68a", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#92400e" }}>
              Save this key — it won't be shown again
            </span>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontSize: "13px", color: "#78350f", margin: 0 }}>
              Copy and store this key securely. Once you leave this page, it cannot be recovered.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <code
                style={{
                  flex: 1,
                  fontSize: "12px",
                  color: "#111827",
                  backgroundColor: "#ffffff",
                  border: "1px solid #fde68a",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                  display: "block",
                }}
              >
                {createdKey}
              </code>
              <button
                onClick={handleCopy}
                style={{
                  flexShrink: 0,
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "1px solid #fde68a",
                  backgroundColor: copied ? "#ecfdf5" : "#ffffff",
                  color: copied ? "#059669" : "#92400e",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved keys */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>Saved Keys</span>
          <span style={{
            marginLeft: "auto",
            fontSize: "11px",
            color: "#6b7280",
            backgroundColor: "#f3f4f6",
            padding: "2px 8px",
            borderRadius: "99px",
          }}>
            {keys.length} {keys.length === 1 ? "key" : "keys"}
          </span>
        </div>

        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {keys.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7" cy="17" r="4"/><path d="M10.5 13.5L21 3"/>
                </svg>
              </div>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0, fontWeight: 500 }}>No API keys yet</p>
              <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>Create your first key above.</p>
            </div>
          ) : (
            keys.map((key) => {
              const { color: sColor, bg: sBg, border: sBorder } = statusStyle(key.status);
              const { color: tColor, bg: tBg, border: tBorder } = keyTypeStyle(key.key_type);
              return (
                <div
                  key={key.id}
                  style={{
                    border: "1px solid #f3f4f6",
                    borderRadius: "12px",
                    padding: "16px",
                    backgroundColor: "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {/* Key header row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{key.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 500, color: tColor, backgroundColor: tBg, border: `1px solid ${tBorder}`, padding: "2px 8px", borderRadius: "99px" }}>
                        {key.key_type}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 500, color: sColor, backgroundColor: sBg, border: `1px solid ${sBorder}`, padding: "2px 8px", borderRadius: "99px" }}>
                        {key.status}
                      </span>
                    </div>
                  </div>

                  {/* Key details */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#9ca3af", minWidth: "80px" }}>Masked Key</span>
                      <code style={{ fontSize: "12px", color: "#374151", fontFamily: "monospace", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: "6px" }}>
                        {key.key_prefix}••••••••••••••
                      </code>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#9ca3af", minWidth: "80px" }}>Created</span>
                      <span style={{ fontSize: "12px", color: "#6b7280", fontFamily: "monospace" }}>{formatDate(key.created_at)}</span>
                    </div>
                    {key.grace_until && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#9ca3af", minWidth: "80px" }}>Grace Until</span>
                        <span style={{ fontSize: "12px", color: "#d97706", fontFamily: "monospace" }}>{formatDate(key.grace_until)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {key.status === "active" ? (
                    isAdmin ? (
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleRotateKey(key.id)}
                          disabled={rotatingId === key.id}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            backgroundColor: "#ffffff",
                            color: "#374151",
                            fontSize: "13px",
                            fontWeight: 500,
                            cursor: rotatingId === key.id ? "not-allowed" : "pointer",
                            opacity: rotatingId === key.id ? 0.6 : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10"/>
                            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                          </svg>
                          {rotatingId === key.id ? "Rotating..." : "Rotate"}
                        </button>

                        <button
                          onClick={() => handleRevokeKey(key.id)}
                          disabled={revokingId === key.id}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            border: "1px solid #fecaca",
                            backgroundColor: "#fef2f2",
                            color: "#dc2626",
                            fontSize: "13px",
                            fontWeight: 500,
                            cursor: revokingId === key.id ? "not-allowed" : "pointer",
                            opacity: revokingId === key.id ? 0.6 : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                          </svg>
                          {revokingId === key.id ? "Revoking..." : "Revoke"}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>
                          Read-only access
                        </span>
                      </div>
                    )
                  ) : key.status === "grace_period" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                      </svg>
                      <span style={{ fontSize: "12px", color: "#92400e", fontWeight: 500 }}>
                        This key is in grace period
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                      </svg>
                      <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: 500 }}>
                        This key has been revoked
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Last result */}
      {result && (
        <div
          style={{
            backgroundColor: "#ffffff",
            border: `1px solid ${result?.error ? "#fecaca" : "#bbf7d0"}`,
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${result?.error ? "#fecaca" : "#bbf7d0"}`, display: "flex", alignItems: "center", gap: "8px" }}>
            {result?.error ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            )}
            <span style={{ fontSize: "13px", fontWeight: 600, color: result?.error ? "#991b1b" : "#065f46" }}>
              {result?.error ? "Error" : "Success"}
            </span>
          </div>
          <pre
            style={{
              padding: "14px 20px",
              fontSize: "12px",
              color: result?.error ? "#991b1b" : "#065f46",
              backgroundColor: result?.error ? "#fef2f2" : "#f0fdf4",
              margin: 0,
              overflowX: "auto",
              fontFamily: "monospace",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
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