import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOnboardingStatus } from "@/lib/auth/onboarding";
import { DashboardSidebar } from "./dashboard/DashboardSidebar";
import { HeaderClientExtras } from "@/components/HeaderClientExtras";

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
    <div className="min-h-screen grid grid-cols-[240px_1fr] bg-[#0A0A0A] font-sans text-zinc-100 selection:bg-zinc-800">
      <DashboardSidebar isAdmin={isAdmin} />

      <div className="flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Role badge */}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wider uppercase ${isAdmin ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50"}`}>
              {isAdmin ? "Admin" : "Member"}
            </span>
          </div>

          <div className="flex items-center gap-3">
             {/* Environment toggle + Command palette trigger */}
             <HeaderClientExtras />

             <div className="h-6 w-px bg-zinc-800" />

             <div className="flex items-center gap-2.5">
                 <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full tracking-wide">Free Plan</span>
                 <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
             </div>
             <div className="h-6 w-px bg-zinc-800" />
             <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-lg" } }} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 md:p-10 bg-[#0A0A0A] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}