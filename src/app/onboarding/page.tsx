"use client";

import { useAuth, useSession } from "@clerk/nextjs";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function OnboardingPage() {
  const { orgId, userId } = useAuth();
  const { session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleComplete = async () => {
    try {
      setLoading(true);

      const token = await session?.getToken();
      const supabase = createSupabaseBrowserClient(token ?? undefined);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ onboarding_complete: true })
        .eq("clerk_user_id", userId)
        .eq("org_id", orgId);

      if (profileError) {
        setResult({ error: profileError.message });
        return;
      }

      const { error: auditError } = await supabase.from("audit_logs").insert([
        {
          org_id: orgId,
          actor_user_id: userId,
          action: "onboarding_completed",
          entity_type: "profile",
          entity_id: userId,
        },
      ]);

      setResult({ success: true, auditError: auditError?.message ?? null });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !orgId || !userId;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/4 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[460px] bg-[#111111] border border-zinc-800/60 rounded-2xl shadow-2xl p-10 flex flex-col gap-7">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center">
            <span className="text-zinc-900 text-sm font-bold">V</span>
          </div>
          <span className="text-zinc-100 text-base font-semibold tracking-tight">VyorAI</span>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Complete Your Setup</h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Finish onboarding to unlock your full dashboard experience.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex flex-col gap-3">
          {[
            { label: "Account created", done: true },
            { label: "Organisation linked", done: !!orgId },
            { label: "Onboarding complete", done: result?.success === true },
          ].map(({ label, done }, i) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${done ? "bg-zinc-100" : "bg-zinc-800/50 border border-zinc-700"
                }`}>
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#09090b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className="text-[11px] text-zinc-600 font-medium">{i + 1}</span>
                )}
              </div>
              <span className={`text-sm ${done ? "text-zinc-200 font-medium" : "text-zinc-600"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-800/50" />

        {/* Status notices */}
        {!orgId && (
          <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-400 leading-relaxed">
              No organisation detected. Please ensure you're part of an org before continuing.
            </p>
          </div>
        )}

        {result?.error && (
          <div className="flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400 leading-relaxed">{result.error}</p>
          </div>
        )}

        {result?.success && (
          <div className="flex items-start gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-400 leading-relaxed">
              Onboarding complete! Redirecting you to the dashboard...
            </p>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleComplete}
          disabled={isDisabled}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 bg-zinc-100 text-zinc-900 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {loading ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className="animate-spin">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Completing setup...
            </>
          ) : (
            "Complete Onboarding →"
          )}
        </button>

        {/* Footer */}
        <p className="text-xs text-zinc-600 text-center">
          Secured by{" "}
          <span className="text-zinc-500 font-medium">Clerk</span> ·{" "}
          <span className="text-zinc-500 font-medium">Supabase</span>
        </p>
      </div>
    </div>
  );
}