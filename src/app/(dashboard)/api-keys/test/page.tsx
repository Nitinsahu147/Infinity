"use client";

import { useState } from "react";

export default function ApiKeyTestPage() {
  const [apiKey, setApiKey] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/api-keys/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !apiKey;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "720px" }}>

      {/* Page header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
          Test API Key
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
          Paste an API key below to verify its validity and inspect its metadata.
        </p>
      </div>

      {/* Input card */}
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
            <circle cx="7" cy="17" r="4"/><path d="M10.5 13.5L21 3"/><path d="M19 5l2 2"/><path d="M15 9l2 2"/>
          </svg>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
            Verify API Key
          </span>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151" }}>
              API Key
            </label>
            <input
              type="text"
              placeholder="Paste your API key here..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "9px 12px",
                fontSize: "13px",
                color: "#111827",
                backgroundColor: "#ffffff",
                outline: "none",
                fontFamily: "monospace",
                boxSizing: "border-box",
              }}
            />
            <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
              The key will be sent to the verification endpoint and never stored.
            </p>
          </div>

          <button
            onClick={handleVerify}
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
              transition: "background-color 0.15s",
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
                Verifying...
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Verify API Key
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result card — only shown after a response */}
      {result !== null && (
        <div
          style={{
            backgroundColor: "#ffffff",
            border: `1px solid ${result?.error ? "#fecaca" : result?.valid === false ? "#fde68a" : "#bbf7d0"}`,
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          {/* Result header */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: `1px solid ${result?.error ? "#fecaca" : result?.valid === false ? "#fde68a" : "#bbf7d0"}`,
              backgroundColor: result?.error ? "#fef2f2" : result?.valid === false ? "#fffbeb" : "#f0fdf4",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {result?.error ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            ) : result?.valid === false ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            )}
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: result?.error ? "#991b1b" : result?.valid === false ? "#92400e" : "#065f46",
              }}
            >
              {result?.error ? "Verification Failed" : result?.valid === false ? "Invalid Key" : "Key Verified"}
            </span>
          </div>

          {/* Result body — clean key/value pairs if possible, fallback to JSON */}
          <div style={{ padding: "16px 20px" }}>
            {result?.error ? (
              <p style={{ fontSize: "13px", color: "#991b1b", margin: 0 }}>{result.error}</p>
            ) : (
              <pre
                style={{
                  fontSize: "12px",
                  color: "#374151",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  margin: 0,
                  overflowX: "auto",
                  fontFamily: "monospace",
                  lineHeight: 1.6,
                }}
              >
                {JSON.stringify(result, null, 2)}
              </pre>
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