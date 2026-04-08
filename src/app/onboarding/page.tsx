"use client";

import { useAuth, useSession } from "@clerk/nextjs";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
  const { orgId, userId } = useAuth();
  const { session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleComplete = async () => {
    try {
      setLoading(true);

      const token = await session?.getToken();
      const supabase = createSupabaseBrowserClient(token ?? undefined);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ onboarding_complete: true })
        .eq("clerk_user_id", userId)
        .eq("org_id", orgId);

      if (profileError) {
        setResult({ error: profileError.message });
        return;
      }

      const { error: auditError } = await supabase.from("audit_logs").insert([
        {
          org_id: orgId,
          actor_user_id: userId,
          action: "onboarding_completed",
          entity_type: "profile",
          entity_id: userId,
        },
      ]);

      setResult({ success: true, auditError: auditError?.message ?? null });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !orgId || !userId;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "inherit",
      }}
    >
      {/* Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          padding: "48px 40px",
          width: "100%",
          maxWidth: "480px",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                backgroundColor: "#111827",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>D</span>
            </div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>DevDash</span>
          </div>

          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Complete Your Setup
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0, lineHeight: 1.6 }}>
            Finish onboarding to unlock your full dashboard experience.
          </p>
        </div>

        {/* Steps indicator */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { label: "Account created", done: true },
            { label: "Organisation linked", done: !!orgId },
            { label: "Onboarding complete", done: result?.success === true },
          ].map(({ label, done }, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: done ? "#111827" : "#f3f4f6",
                  border: done ? "none" : "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background-color 0.2s",
                }}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 500 }}>
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: "14px",
                  color: done ? "#111827" : "#9ca3af",
                  fontWeight: done ? 500 : 400,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", backgroundColor: "#f3f4f6" }} />

        {/* Status notices */}
        {!orgId && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "12px 14px",
              borderRadius: "10px",
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
            }}
          >
            <span style={{ fontSize: "14px", flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: "13px", color: "#92400e", margin: 0, lineHeight: 1.5 }}>
              No organisation detected. Please ensure you're part of an org before continuing.
            </p>
          </div>
        )}

        {result?.error && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "12px 14px",
              borderRadius: "10px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
            }}
          >
            <span style={{ fontSize: "14px", flexShrink: 0 }}>✕</span>
            <p style={{ fontSize: "13px", color: "#991b1b", margin: 0, lineHeight: 1.5 }}>
              {result.error}
            </p>
          </div>
        )}

        {result?.success && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "12px 14px",
              borderRadius: "10px",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
            }}
          >
            <span style={{ fontSize: "14px", flexShrink: 0 }}>✓</span>
            <p style={{ fontSize: "13px", color: "#166534", margin: 0, lineHeight: 1.5 }}>
              Onboarding complete! Redirecting you to the dashboard...
            </p>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleComplete}
          disabled={isDisabled}
          style={{
            width: "100%",
            padding: "12px 20px",
            borderRadius: "12px",
            backgroundColor: isDisabled ? "#f3f4f6" : "#111827",
            color: isDisabled ? "#9ca3af" : "#ffffff",
            fontSize: "14px",
            fontWeight: 500,
            border: "none",
            cursor: isDisabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={e => {
            if (!isDisabled) e.currentTarget.style.backgroundColor = "#1f2937";
          }}
          onMouseLeave={e => {
            if (!isDisabled) e.currentTarget.style.backgroundColor = "#111827";
          }}
        >
          {loading ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{ animation: "spin 0.8s linear infinite" }}
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Completing setup...
            </>
          ) : (
            "Complete Onboarding →"
          )}
        </button>

        {/* Footer */}
        <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0, textAlign: "center" }}>
          Secured by{" "}
          <span style={{ color: "#6b7280", fontWeight: 500 }}>Clerk</span> ·{" "}
          <span style={{ color: "#6b7280", fontWeight: 500 }}>Supabase</span>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}