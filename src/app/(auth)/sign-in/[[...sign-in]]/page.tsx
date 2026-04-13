import { SignIn } from "@clerk/nextjs";

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
              <span className="text-zinc-900 text-sm font-bold">V</span>
            </div>
            <span className="text-zinc-100 text-base font-semibold tracking-tight">VyorAI</span>
          </div>
        </div>

        {/* Center quote */}
        <div className="relative z-10 flex flex-col gap-6">
          <div className="w-10 h-0.5 bg-indigo-500 rounded-full" />
          <p className="text-2xl font-semibold text-zinc-100 leading-snug max-w-[340px]">
            "The fastest way to ship multi-tenant apps."
          </p>
          <p className="text-sm text-zinc-500">
            Trusted by developers building production-grade SaaS.
          </p>

          {/* Stats row */}
          <div className="flex gap-8 mt-2">
            {[
              { value: "10k+", label: "Developers" },
              { value: "99.9%", label: "Uptime" },
              { value: "50ms", label: "Avg response" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-xl font-bold text-zinc-100">{value}</span>
                <span className="text-xs text-zinc-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-zinc-700">
          © {new Date().getFullYear()} VyorAI. All rights reserved.
        </p>
      </div>

      {/* Right panel — Clerk SignIn */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 gap-6 bg-[#0A0A0A]">
        {/* Mobile-only logo */}
        <div className="flex md:hidden items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-zinc-100 flex items-center justify-center">
            <span className="text-zinc-900 text-xs font-bold">V</span>
          </div>
          <span className="text-zinc-100 text-sm font-semibold">VyorAI</span>
        </div>

        {/* Clerk component */}
        <SignIn />
      </div>
    </div>
  );
}