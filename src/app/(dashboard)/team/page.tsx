"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { Users, Lock, Send, CheckCircle2, XCircle } from "lucide-react";

export default function TeamPage() {
  const { orgRole } = useAuth();

  const [emailAddress, setEmailAddress] = useState("");
  const [role, setRole] = useState<"org:member" | "org:admin">("org:member");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = orgRole === "org:admin";
  const isDisabled = loading || !emailAddress;

  const handleInvite = async () => {
    if (!isAdmin) {
      setResult({ error: "Only admins can invite members." });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/org/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress, role }),
      });

      const data = await res.json();
      setResult(data);

      if (data.success) {
        setEmailAddress("");
        setRole("org:member");
      }
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-8 max-w-[640px]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Team</h1>
          <p className="text-sm text-zinc-400">Team management is restricted to organisation admins.</p>
        </div>

        <div className="bg-[#111111] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2.5">
            <Lock size={14} className="text-zinc-400" />
            <span className="text-sm font-medium text-zinc-200">Access Restricted</span>
          </div>
          <div className="p-5">
            <p className="text-sm text-zinc-400">Only admins can invite and manage team members.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-[640px]">
      {/* Page header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Team</h1>
        <p className="text-sm text-zinc-400">Invite members to collaborate in your organisation.</p>
      </div>

      {/* Invite card */}
      <div className="bg-[#111111] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2.5">
          <Users size={14} className="text-zinc-400" />
          <span className="text-sm font-medium text-zinc-200">Invite Member</span>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Email input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-400">Email Address</label>
            <input
              type="email"
              placeholder="colleague@company.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-colors"
            />
          </div>

          {/* Role select */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-400">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "org:member" | "org:admin")}
              className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-colors"
            >
              <option value="org:member">Member</option>
              <option value="org:admin">Admin</option>
            </select>
            <p className="text-xs text-zinc-600">
              {role === "org:admin"
                ? "Admins can manage members, API keys, and org settings."
                : "Members can access the dashboard and use API keys."}
            </p>
          </div>

          {/* Submit button */}
          <button
            onClick={handleInvite}
            disabled={isDisabled}
            className="self-start flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 bg-zinc-100 text-zinc-900 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {loading ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className="animate-spin">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send size={13} />
                Send Invite
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
              {result?.error ? "Invite Failed" : "Invite Sent Successfully"}
            </span>
          </div>

          <div className="p-5">
            {result?.error ? (
              <p className="text-sm text-red-400">{result.error}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {result?.invitationId && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 min-w-[100px]">Invitation ID</span>
                    <code className="text-xs text-zinc-300 font-mono bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5">
                      {result.invitationId}
                    </code>
                  </div>
                )}
                <p className="text-sm text-zinc-400">
                  An invitation email has been sent. They'll be able to join your organisation once they accept.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}