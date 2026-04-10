"use client";

import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  const { isSignedIn } = useUser();

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand mark */}
      <div className="absolute top-6 left-8 flex items-center gap-2.5 z-10">
        <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center">
          <span className="text-zinc-900 text-sm font-bold">V</span>
        </div>
        <span className="text-zinc-100 text-sm font-semibold tracking-tight">VyorAI</span>
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-[420px] bg-[#111111] border border-zinc-800/60 rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-6">
        {/* Status badge */}
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Multi-Tenant · Clerk + Supabase
        </div>

        {/* Heading block */}
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight leading-tight">
            Developer Dashboard
          </h1>
          <p className="text-sm text-zinc-500 max-w-[300px] leading-relaxed mx-auto">
            A unified analytics platform with multi-tenant support. Manage projects, track metrics, and ship faster.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-zinc-800/60" />

        {/* CTA Buttons */}
        {!isSignedIn ? (
          <div className="flex flex-col gap-3 w-full">
            <Link
              href="/sign-in"
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-all"
            >
              Sign In →
            </Link>
            <Link
              href="/sign-up"
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:text-zinc-100 transition-all"
            >
              Create Account
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full">
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-all"
            >
              Go to Dashboard →
            </Link>
            <div className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center bg-zinc-900 shrink-0">
              <UserButton />
            </div>
          </div>
        )}

        {/* Footer note */}
        <p className="text-xs text-zinc-600 text-center">
          Secure authentication via Clerk — your data stays private.
        </p>
      </div>

      {/* Feature pills */}
      <div className="relative z-10 flex flex-wrap justify-center gap-2 mt-6 max-w-[420px]">
        {["⚡ Real-time analytics", "🔐 Role-based access", "📊 Multi-tenant support"].map((label) => (
          <div
            key={label}
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-500"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-xs text-zinc-700">
        © {new Date().getFullYear()} NexusAI. All rights reserved.
      </p>
    </main>
  );
}