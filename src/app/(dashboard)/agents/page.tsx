"use client";

import { useAuth, useSession } from "@clerk/nextjs";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Bot, Plus, Lock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export default function AgentsPage() {
  const { orgId, userId, orgRole } = useAuth();
  const { session } = useSession();

  const [name, setName] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = orgRole === "org:admin";

  const handleInsert = async () => {
    if (!isAdmin) {
      setResult({ error: "Only admins can create agents" });
      return;
    }
    try {
      setLoading(true);
      const token = await session?.getToken();
      const supabase = createSupabaseBrowserClient(token ?? undefined);

      const { data, error } = await supabase
        .from("agents")
        .insert([{ name, org_id: orgId }])
        .select();

      if (error) {
        setResult({ data: null, error });
        return;
      }

      const createdAgent = data?.[0];

      if (createdAgent) {
        const { error: auditError } = await supabase.from("audit_logs").insert([
          {
            org_id: orgId,
            actor_user_id: userId,
            action: "agent_created",
            entity_type: "agent",
            entity_id: String(createdAgent.id),
          },
        ]);
        setResult({ data, error: null, auditError: auditError ?? null });
      } else {
        setResult({ data, error: null });
      }

      setName("");
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  // Non-admin view
  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-8 max-w-[640px]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Agents</h1>
          <p className="text-sm text-zinc-400">Manage your organisation's agents.</p>
        </div>

        <div className="bg-[#111111] border border-amber-500/20 rounded-xl p-5 flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Lock size={16} className="text-amber-400" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-amber-400">Admin access required</p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Only organisation admins can create and manage agents. Contact your admin to request access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isDisabled = loading || !name || !orgId;

  return (
    <div className="flex flex-col gap-8 max-w-[640px]">
      {/* Page header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Agents</h1>
        <p className="text-sm text-zinc-400">Create and manage agents for your organisation.</p>
      </div>

      {/* Org context badge */}
      <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#111111] border border-zinc-800/60 rounded-lg self-start">
        <span className={`w-2 h-2 rounded-full shrink-0 ${orgId ? "bg-emerald-500" : "bg-amber-500"}`} />
        <span className="text-xs text-zinc-500">Org:</span>
        <code className="text-xs text-zinc-300 font-mono font-medium">{orgId ?? "No org selected"}</code>
      </div>

      {/* Create agent card */}
      <div className="bg-[#111111] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2.5">
          <Bot size={14} className="text-zinc-400" />
          <span className="text-sm font-medium text-zinc-200">Create New Agent</span>
          <span className="ml-auto text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded tracking-wider uppercase">
            Admin
          </span>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-400">Agent Name</label>
            <input
              type="text"
              placeholder="e.g. Support Bot, Analytics Agent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-colors"
            />
          </div>

          <button
            onClick={handleInsert}
            disabled={isDisabled}
            className="self-start flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 bg-zinc-100 text-zinc-900 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {loading ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className="animate-spin">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Adding...
              </>
            ) : (
              <>
                <Plus size={13} />
                Add Agent
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result card */}
      {result !== null && (
        <div className={`bg-[#111111] border rounded-xl overflow-hidden shadow-sm ${result?.error ? "border-red-500/20" : "border-emerald-500/20"}`}>
          <div className={`px-5 py-4 border-b flex items-center gap-2.5 ${result?.error ? "border-red-500/20 bg-red-500/5" : "border-emerald-500/20 bg-emerald-500/5"}`}>
            {result?.error
              ? <XCircle size={14} className="text-red-400" />
              : <CheckCircle2 size={14} className="text-emerald-400" />
            }
            <span className={`text-sm font-medium ${result?.error ? "text-red-400" : "text-emerald-400"}`}>
              {result?.error ? "Failed to create agent" : "Agent created successfully"}
            </span>
          </div>

          <div className="p-5">
            {result?.error ? (
              <p className="text-sm text-red-400">
                {typeof result.error === "string" ? result.error : JSON.stringify(result.error)}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {result?.data?.[0] && (
                  <div className="flex flex-col gap-2">
                    {[
                      { label: "Agent ID", value: String(result.data[0].id) },
                      { label: "Name", value: result.data[0].name },
                      { label: "Org ID", value: result.data[0].org_id },
                      { label: "Status", value: result.data[0].status ?? "active" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500 min-w-[70px]">{label}</span>
                        <code className="text-xs text-zinc-300 font-mono bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5">
                          {value}
                        </code>
                      </div>
                    ))}
                  </div>
                )}
                {result?.auditError && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                    <span className="text-xs text-amber-400">
                      Audit log warning: {result.auditError.message ?? JSON.stringify(result.auditError)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}