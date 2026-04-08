import { SignUp } from "@clerk/nextjs";

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
        className="left-panel"
        style={{
          display: "none",
          flex: "1",
          backgroundColor: "#111827",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
        }}
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

        {/* Center content */}
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
            "Start building in minutes, not days."
          </p>
          <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
            Join thousands of developers shipping faster with DevDash.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "8px" }}>
            {[
              { icon: "⚡", title: "Instant setup", desc: "Connect Clerk + Supabase in one click" },
              { icon: "🔐", title: "Secure by default", desc: "Role-based access out of the box" },
              { icon: "📊", title: "Analytics ready", desc: "Multi-tenant metrics from day one" },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: "#1f2937",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#f9fafb" }}>
                    {title}
                  </span>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <p style={{ fontSize: "12px", color: "#4b5563", margin: 0 }}>
          © {new Date().getFullYear()} DevDash. All rights reserved.
        </p>
      </div>

      {/* Right panel — Clerk SignUp */}
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

        {/* Welcome text above form */}
        <div style={{ textAlign: "center", maxWidth: "360px" }}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 6px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Create your account
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
            Free to get started. No credit card required.
          </p>
        </div>

        {/* Clerk component */}
        <SignUp />

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