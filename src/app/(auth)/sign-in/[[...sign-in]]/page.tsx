import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        fontFamily: "inherit",
      }}
    >
      {/* Left panel — branding */}
      <div
        style={{
          display: "none",
          flex: "1",
          backgroundColor: "#111827",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
        }}
        className="left-panel"
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#111827", fontSize: "14px", fontWeight: 700 }}>D</span>
          </div>
          <span style={{ color: "#ffffff", fontSize: "16px", fontWeight: 600 }}>DevDash</span>
        </div>

        {/* Center quote */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              width: "40px",
              height: "3px",
              backgroundColor: "#4f46e5",
              borderRadius: "2px",
            }}
          />
          <p
            style={{
              fontSize: "26px",
              fontWeight: 600,
              color: "#ffffff",
              lineHeight: 1.4,
              margin: 0,
              maxWidth: "340px",
            }}
          >
            "The fastest way to ship multi-tenant apps."
          </p>
          <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
            Trusted by developers building production-grade SaaS.
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "32px", marginTop: "8px" }}>
            {[
              { value: "10k+", label: "Developers" },
              { value: "99.9%", label: "Uptime" },
              { value: "50ms", label: "Avg response" },
            ].map(({ value, label }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff" }}>{value}</span>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <p style={{ fontSize: "12px", color: "#4b5563", margin: 0 }}>
          © {new Date().getFullYear()} DevDash. All rights reserved.
        </p>
      </div>

      {/* Right panel — Clerk SignIn */}
      <div
        style={{
          flex: "1",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          gap: "24px",
        }}
      >
        {/* Mobile-only logo */}
        <div
          className="mobile-logo"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
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

        {/* Clerk component */}
        <SignIn />

        {/* Bottom tagline */}
        <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0, textAlign: "center" }}>
          Secured by{" "}
          <span style={{ color: "#6b7280", fontWeight: 500 }}>Clerk</span> ·{" "}
          <span style={{ color: "#6b7280", fontWeight: 500 }}>Supabase</span>
        </p>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 768px) {
          .left-panel {
            display: flex !important;
          }
          .mobile-logo {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}