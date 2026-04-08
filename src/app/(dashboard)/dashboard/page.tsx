import { auth, currentUser } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardLivePanel from "@/components/dashboard-live-panel";

export default async function DashboardPage() {
  const { userId, orgId } = await auth();
  const user = await currentUser();
  const supabase = await createSupabaseServerClient();

  if (userId && orgId) {
    await supabase.from("profiles").upsert(
      {
        clerk_user_id: userId,
        email: user?.emailAddresses?.[0]?.emailAddress ?? null,
        full_name:
          `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || null,
        org_id: orgId,
      },
      { onConflict: "clerk_user_id" }
    );
  }

  const [
    { count: agentCount },
    { count: profileCount },
    { data: recentAgents },
  ] = await Promise.all([
    supabase.from("agents").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("agents")
      .select("*")
      .order("id", { ascending: false })
      .limit(5),
  ]);

  const displayName =
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    "N/A";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* Page header */}
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
          Overview
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
          Welcome back, {user?.firstName ?? "Developer"}. Here's what's happening.
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
        }}
      >
        {[
          {
            label: "Total Agents",
            value: agentCount ?? 0,
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            ),
            color: "#4f46e5",
            bg: "#eef2ff",
          },
          {
            label: "Total Members",
            value: profileCount ?? 0,
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
            ),
            color: "#0891b2",
            bg: "#ecfeff",
          },
          {
            label: "Active Org",
            value: orgId ? "Yes" : "None",
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              </svg>
            ),
            color: "#059669",
            bg: "#ecfdf5",
          },
        ].map(({ label, value, icon, color, bg }) => (
          <div
            key={label}
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>{label}</span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: color,
                }}
              >
                {icon}
              </div>
            </div>
            <span style={{ fontSize: "26px", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Session info card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        {/* Card header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
            Active Session
          </span>
        </div>

        {/* Card body */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* User row */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#111827",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "#fff", fontSize: "13px", fontWeight: 600 }}>{initials}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{displayName}</span>
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>Authenticated via Clerk</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", backgroundColor: "#f3f4f6" }} />

          {/* Info rows */}
          {[
            { label: "User ID", value: userId ?? "Not signed in" },
            { label: "Org ID", value: orgId ?? "No active organization" },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <span style={{ fontSize: "13px", color: "#6b7280", flexShrink: 0 }}>{label}</span>
              <span
                style={{
                  fontSize: "12px",
                  color: "#374151",
                  fontFamily: "monospace",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  padding: "2px 8px",
                  wordBreak: "break-all",
                  textAlign: "right",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Live panel — untouched, just wrapped */}
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
            Live Activity
          </span>
          <span
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "11px",
              color: "#059669",
              fontWeight: 500,
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
            Live
          </span>
        </div>
        <div style={{ padding: "20px" }}>
          <DashboardLivePanel
            initialAgentCount={agentCount ?? 0}
            initialProfileCount={profileCount ?? 0}
            initialRecentAgents={recentAgents ?? []}
          />
        </div>
      </div>

    </div>
  );
}