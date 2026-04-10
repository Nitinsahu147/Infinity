import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Left panel — branding */}
      <div className="hidden md:flex flex-1 flex-col justify-between p-12 bg-[#0A0A0A] border-r border-zinc-800/60 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        {/* Radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center">
              <span className="text-zinc-900 text-sm font-bold">N</span>
            </div>
            <span className="text-zinc-100 text-base font-semibold tracking-tight">NexusAI</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col gap-6">
          <div className="w-10 h-0.5 bg-indigo-500 rounded-full" />
          <p className="text-2xl font-semibold text-zinc-100 leading-snug max-w-[340px]">
            "Start building in minutes, not days."
          </p>
          <p className="text-sm text-zinc-500">
            Join thousands of developers shipping faster with NexusAI.
          </p>

          {/* Feature list */}
          <div className="flex flex-col gap-4 mt-2">
            {[
              { icon: "⚡", title: "Instant setup", desc: "Connect Clerk + Supabase in one click" },
              { icon: "🔐", title: "Secure by default", desc: "Role-based access out of the box" },
              { icon: "📊", title: "Analytics ready", desc: "Multi-tenant metrics from day one" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-3.5 items-start">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-base shrink-0">
                  {icon}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-zinc-200">{title}</span>
                  <span className="text-xs text-zinc-600">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-zinc-700">
          © {new Date().getFullYear()} NexusAI. All rights reserved.
        </p>
      </div>

      {/* Right panel — Clerk SignUp */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 gap-6 bg-[#0A0A0A]">
        {/* Mobile-only logo */}
        <div className="flex md:hidden items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-zinc-100 flex items-center justify-center">
            <span className="text-zinc-900 text-xs font-bold">N</span>
          </div>
          <span className="text-zinc-100 text-sm font-semibold">NexusAI</span>
        </div>

        {/* Welcome text */}
        <div className="text-center max-w-[360px]">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight mb-1.5">
            Create your account
          </h1>
          <p className="text-sm text-zinc-500">Free to get started. No credit card required.</p>
        </div>

        {/* Clerk component */}
        <SignUp />

        {/* Bottom tagline */}
        <p className="text-xs text-zinc-600 text-center">
          Secured by{" "}
          <span className="text-zinc-500 font-medium">Clerk</span> ·{" "}
          <span className="text-zinc-500 font-medium">Supabase</span>
        </p>
      </div>
    </div>
  );
}