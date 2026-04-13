"use client";

import { OrganizationList } from "@clerk/nextjs";

export default function OrganizationSelectPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/4 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[480px] bg-[#111111] border border-zinc-800/60 rounded-2xl shadow-2xl p-10 flex flex-col gap-7">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center">
            <span className="text-zinc-900 text-sm font-bold">V</span>
          </div>
          <span className="text-zinc-100 text-base font-semibold tracking-tight">VyorAI</span>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Select your Organisation</h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Choose an existing organisation or create a new one to get started.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-800/50" />

        {/* Info chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { icon: "🏢", label: "Multi-tenant workspace" },
            { icon: "🔐", label: "Role-based access" },
            { icon: "📊", label: "Isolated analytics" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-500"
            >
              <span>{icon}</span>
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


      </div>
    </div>
  );
}