"use client";

import { useAuth, useSession } from "@clerk/nextjs";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { ScrollText, Lock } from "lucide-react";

type Log = {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
};

export default function AuditLogsPage() {
  const { orgId, orgRole } = useAuth();
  const { session } = useSession();

  const [token, setToken] = useState<string | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);

  const isAdmin = orgRole === "org:admin";

  useEffect(() => {
    const loadToken = async () => {
      const t = await session?.getToken();
      setToken(t ?? null);
    };
    loadToken();
  }, [session]);

  const supabase = useMemo(() => {
    return createSupabaseBrowserClient(token ?? undefined);
  }, [token]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .order("id", { ascending: false });

      setLogs(data ?? []);
    };

    if (token && orgId && isAdmin) fetchLogs();
  }, [token, orgId, isAdmin]);

  const format = (d: string) =>
    new Date(d).toISOString().replace("T", " ").slice(0, 19);

  const actionBadge = (action: string) => {
    if (action.includes("creat")) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (action.includes("delet")) return "text-red-400 bg-red-500/10 border-red-500/20";
    if (action.includes("updat") || action.includes("complet")) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
  };

  // Member view (restricted)
  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-8 max-w-[640px]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Audit Logs</h1>
          <p className="text-sm text-zinc-400">Access restricted to organisation admins.</p>
        </div>

        <div className="bg-[#111111] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2.5">
            <Lock size={14} className="text-zinc-400" />
            <span className="text-sm font-medium text-zinc-200">Access Restricted</span>
          </div>
          <div className="p-5">
            <p className="text-sm text-zinc-400">Only admins can view audit logs.</p>
          </div>
        </div>
      </div>
    );
  }

  // Admin view
  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Audit Logs</h1>
          <p className="text-sm text-zinc-400">A full record of actions performed in your organisation.</p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#111111] border border-zinc-800/60 rounded-lg text-sm text-zinc-400 font-medium">
          {logs.length} {logs.length === 1 ? "entry" : "entries"}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-[#111111] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2.5">
          <ScrollText size={14} className="text-zinc-400" />
          <span className="text-sm font-medium text-zinc-200">Activity Log</span>
        </div>

        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
              <ScrollText size={18} className="text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-zinc-400">No audit logs yet</p>
            <p className="text-xs text-zinc-600">Actions performed in your org will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  {["Action", "Entity Type", "Entity ID", "Time"].map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-medium border px-2.5 py-1 rounded-full ${actionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400 text-xs">{log.entity_type}</td>
                    <td className="px-5 py-3.5">
                      <code className="text-xs text-zinc-400 font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                        {log.entity_id}
                      </code>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-500 font-mono">{format(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}