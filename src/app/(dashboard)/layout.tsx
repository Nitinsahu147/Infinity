import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOnboardingStatus } from "@/lib/auth/onboarding";
import { DashboardSidebar } from "./dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, orgId, orgRole } = await auth();

  if (!userId) redirect("/sign-in");
  if (!orgId) redirect("/organization-select");

  const isOnboardingComplete = await getOnboardingStatus(userId, orgId);
  if (!isOnboardingComplete) redirect("/onboarding");

  const isAdmin = orgRole === "org:admin";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        backgroundColor: "#f8fafc",
        fontFamily: "inherit",
      }}
    >
      <DashboardSidebar isAdmin={isAdmin} />

      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Topbar */}
        <header
          style={{
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <OrganizationSwitcher
              appearance={{
                elements: { rootBox: { fontSize: "14px" } },
              }}
            />
            {/* Role badge */}
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: "99px",
                backgroundColor: isAdmin ? "#eef2ff" : "#f3f4f6",
                color: isAdmin ? "#4f46e5" : "#6b7280",
                border: `1px solid ${isAdmin ? "#c7d2fe" : "#e5e7eb"}`,
                letterSpacing: "0.02em",
              }}
            >
              {isAdmin ? "Admin" : "Member"}
            </span>
          </div>

          <UserButton />
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "32px 28px", backgroundColor: "#f8fafc" }}>
          {children}
        </main>
      </div>
    </div>
  );
}