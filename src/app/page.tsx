"use client";

import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  const { isSignedIn } = useUser();

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "inherit",
      }}
    >
      {/* Brand mark */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          left: "32px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
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

      {/* Main card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {/* Status badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            borderRadius: "999px",
            backgroundColor: "#f1f5f9",
            fontSize: "11px",
            fontWeight: 500,
            color: "#64748b",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              display: "inline-block",
            }}
          />
          Multi-Tenant · Clerk + Supabase
        </div>

        {/* Heading block */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "8px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Developer Dashboard
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: 0,
              lineHeight: 1.6,
              maxWidth: "300px",
            }}
          >
            A unified analytics platform with multi-tenant support. Manage projects, track metrics, and ship faster.
          </p>
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: "1px", backgroundColor: "#f3f4f6" }} />

        {/* CTA Buttons */}
        {!isSignedIn ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
            <Link
              href="/sign-in"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "11px 20px",
                borderRadius: "12px",
                backgroundColor: "#111827",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1f2937")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#111827")}
            >
              Sign In →
            </Link>
            <Link
              href="/sign-up"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "11px 20px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
                color: "#374151",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                transition: "background-color 0.15s, border-color 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = "#f9fafb";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              Create Account
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
            }}
          >
            <Link
              href="/dashboard"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "11px 20px",
                borderRadius: "12px",
                backgroundColor: "#111827",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Go to Dashboard →
            </Link>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ffffff",
                flexShrink: 0,
              }}
            >
              <UserButton />
            </div>
          </div>
        )}

        {/* Footer note */}
        <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0, textAlign: "center" }}>
          Secure authentication via Clerk — your data stays private.
        </p>
      </div>

      {/* Feature pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
          marginTop: "28px",
          maxWidth: "420px",
        }}
      >
        {["⚡ Real-time analytics", "🔐 Role-based access", "📊 Multi-tenant support"].map((label) => (
          <div
            key={label}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              fontSize: "12px",
              color: "#6b7280",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Footer */}
      <p style={{ marginTop: "32px", fontSize: "12px", color: "#9ca3af" }}>
        © {new Date().getFullYear()} DevDash. All rights reserved.
      </p>
    </main>
  );
}