"use client";

import { OrganizationList } from "@clerk/nextjs";

export default function OrganizationSelectPage() {
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
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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

        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Select your Organisation
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0, lineHeight: 1.6 }}>
            Choose an existing organisation or create a new one to get started.
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", backgroundColor: "#f3f4f6" }} />

        {/* Info chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {[
            { icon: "🏢", label: "Multi-tenant workspace" },
            { icon: "🔐", label: "Role-based access" },
            { icon: "📊", label: "Isolated analytics" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "8px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e5e7eb",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              <span style={{ fontSize: "12px" }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* Clerk OrganizationList */}
        <OrganizationList
          hidePersonal
          afterSelectOrganizationUrl="/dashboard"
          afterCreateOrganizationUrl="/onboarding"
        />

        {/* Footer */}
        <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0, textAlign: "center" }}>
          Secured by{" "}
          <span style={{ color: "#6b7280", fontWeight: 500 }}>Clerk</span> ·{" "}
          <span style={{ color: "#6b7280", fontWeight: 500 }}>Supabase</span>
        </p>
      </div>
    </div>
  );
}