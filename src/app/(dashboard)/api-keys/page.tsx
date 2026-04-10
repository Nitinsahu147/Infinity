"use client";

import { useAuth, useSession, useReverification } from "@clerk/nextjs";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { Key, Lock, RotateCcw, Ban, Copy, Check, AlertTriangle, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";

type ApiKeyRow = {
  id: number;
  org_id: string;
  name: string;
  key_prefix: string;
  key_type: "secret" | "publishable" | "restricted";
  status: string;
  grace_until: string | null;
  created_at: string;
  rotated_from_key_id?: number | null;
  replaced_by_key_id?: number | null;
};

export default function ApiKeysPage() {
  const { orgId, orgRole } = useAuth();
  const { session } = useSession();

  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [keyType, setKeyType] = useState<"secret" | "publishable" | "restricted">("secret");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [rotatingId, setRotatingId] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

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

  const fetchKeys = async () => {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setResult({ error: error.message });
      return;
    }
    setKeys(data ?? []);
  };

  useEffect(() => {
    if (token && orgId) fetchKeys();
  }, [token, orgId]);

  const handleCreateKey = async () => {
    if (!isAdmin) {
      setResult({ error: "Only admins can create API keys." });
      return;
    }

    try {
      setLoading(true);
      setCreatedKey(null);
      const res = await fetch("/api/api-keys/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, keyType }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setCreatedKey(data.key);
        setName("");
        setKeyType("secret");
        await fetchKeys();
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const performRevokeKey = async (keyId: number) => {
    try {
      setRevokingId(keyId);
      const res = await fetch("/api/api-keys/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) await fetchKeys();
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Something went wrong" });
    } finally {
      setRevokingId(null);
    }
  };

  const performRotateKey = async (keyId: number) => {
    try {
      setRotatingId(keyId);
      setCreatedKey(null);
      const res = await fetch("/api/api-keys/rotate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId, graceHours: 48 }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setCreatedKey(data.key);
        await fetchKeys();
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Something went wrong" });
    } finally {
      setRotatingId(null);
    }
  };

  const handleRevokeWithReverification = useReverification(
    async (keyId: number) => { await performRevokeKey(keyId); }
  );

  const handleRotateWithReverification = useReverification(
    async (keyId: number) => { await performRotateKey(keyId); }
  );

  const handleRevokeKey = async (keyId: number) => {
    if (!isAdmin) {
      setResult({ error: "Only admins can revoke API keys." });
      return;
    }
    try {
      await handleRevokeWithReverification(keyId);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Reverification cancelled or failed" });
    }
  };

  const handleRotateKey = async (keyId: number) => {
    if (!isAdmin) {
      setResult({ error: "Only admins can rotate API keys." });
      return;
    }
    try {
      await handleRotateWithReverification(keyId);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Reverification cancelled or failed" });
    }
  };

  const formatDate = (value: string | null) => {
    if (!value) return "N/A";
    return new Date(value).toISOString().replace("T", " ").slice(0, 19);
  };

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusBadge = (status: string) => {
    if (status === "active") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (status === "grace_period") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    if (status === "revoked") return "text-red-400 bg-red-500/10 border-red-500/20";
    return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
  };

  const keyTypeBadge = (type: string) => {
    if (type === "secret") return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    if (type === "publishable") return "text-sky-400 bg-sky-500/10 border-sky-500/20";
    return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
  };

  const isCreateDisabled = loading || !name || !orgId;

  return (
    <div className="flex flex-col gap-8 max-w-[860px]">
      {/* Page header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">API Keys</h1>
        <p className="text-sm text-zinc-400">
          {isAdmin
            ? "Create and manage API keys for your organisation."
            : "View your organisation's API keys and use them in read-only mode."}
        </p>
      </div>

      {/* Create key card / member notice */}
      {isAdmin ? (
        <div className="bg-[#111111] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2.5">
            <Key size={14} className="text-zinc-400" />
            <span className="text-sm font-medium text-zinc-200">Create New Key</span>
          </div>

          <div className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-zinc-400">Key Name</label>
              <input
                type="text"
                placeholder="e.g. Production Key"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-zinc-400">Key Type</label>
              <select
                value={keyType}
                onChange={(e) => setKeyType(e.target.value as "secret" | "publishable" | "restricted")}
                className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-colors"
              >
                <option value="secret">Secret Key</option>
                <option value="publishable">Publishable Key</option>
                <option value="restricted">Restricted Key</option>
              </select>
            </div>

            <button
              onClick={handleCreateKey}
              disabled={isCreateDisabled}
              className="self-start flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 bg-zinc-100 text-zinc-900 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {loading ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    className="animate-spin">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Creating...
                </>
              ) : "Create API Key"}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#111111] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2.5">
            <Lock size={14} className="text-zinc-400" />
            <span className="text-sm font-medium text-zinc-200">Read-only Access</span>
          </div>
          <div className="p-5">
            <p className="text-sm text-zinc-400">
              Members can view and use API keys, but cannot create, rotate, or revoke them.
            </p>
          </div>
        </div>
      )}

      {/* Created key banner */}
      {createdKey && (
        <div className="bg-[#111111] border border-amber-500/20 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-amber-500/20 bg-amber-500/5 flex items-center gap-2.5">
            <AlertTriangle size={14} className="text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Save this key — it won't be shown again</span>
          </div>
          <div className="p-5 flex flex-col gap-3">
            <p className="text-sm text-zinc-400">
              Copy and store this key securely. Once you leave this page, it cannot be recovered.
            </p>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-xs text-zinc-300 font-mono bg-[#0A0A0A] border border-amber-500/20 rounded-lg px-3 py-2.5 break-all">
                {createdKey}
              </code>
              <button
                onClick={handleCopy}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  copied
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-[#0A0A0A] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved keys */}
      <div className="bg-[#111111] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2.5">
          <Lock size={14} className="text-zinc-400" />
          <span className="text-sm font-medium text-zinc-200">Saved Keys</span>
          <span className="ml-auto text-xs text-zinc-500 bg-zinc-800/50 border border-zinc-700/50 px-2 py-0.5 rounded-full">
            {keys.length} {keys.length === 1 ? "key" : "keys"}
          </span>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {keys.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
                <Key size={18} className="text-zinc-600" />
              </div>
              <p className="text-sm font-medium text-zinc-400">No API keys yet</p>
              <p className="text-xs text-zinc-600">Create your first key above.</p>
            </div>
          ) : (
            keys.map((key) => (
              <div
                key={key.id}
                className="bg-[#0A0A0A] border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-3"
              >
                {/* Key header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-sm font-medium text-zinc-200">{key.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-medium border px-2 py-0.5 rounded-full ${keyTypeBadge(key.key_type)}`}>
                      {key.key_type}
                    </span>
                    <span className={`text-[11px] font-medium border px-2 py-0.5 rounded-full ${statusBadge(key.status)}`}>
                      {key.status}
                    </span>
                  </div>
                </div>

                {/* Key details */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 min-w-[80px]">Masked Key</span>
                    <code className="text-xs text-zinc-400 font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
                      {key.key_prefix}••••••••••••••
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 min-w-[80px]">Created</span>
                    <span className="text-xs text-zinc-400 font-mono">{formatDate(key.created_at)}</span>
                  </div>
                  {key.grace_until && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 min-w-[80px]">Grace Until</span>
                      <span className="text-xs text-amber-400 font-mono">{formatDate(key.grace_until)}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {key.status === "active" ? (
                  isAdmin ? (
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleRotateKey(key.id)}
                        disabled={rotatingId === key.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-400 text-xs font-medium hover:text-zinc-200 hover:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <RotateCcw size={12} />
                        {rotatingId === key.id ? "Rotating..." : "Rotate"}
                      </button>
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        disabled={revokingId === key.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <Ban size={12} />
                        {revokingId === key.id ? "Revoking..." : "Revoke"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                      <Lock size={12} className="text-zinc-500" />
                      <span className="text-xs text-zinc-500 font-medium">Read-only access</span>
                    </div>
                  )
                ) : key.status === "grace_period" ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <AlertTriangle size={12} className="text-amber-400" />
                    <span className="text-xs text-amber-400 font-medium">This key is in grace period</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <Ban size={12} className="text-red-400" />
                    <span className="text-xs text-red-400 font-medium">This key has been revoked</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Last result */}
      {result && (
        <div className={`bg-[#111111] border rounded-xl overflow-hidden shadow-sm ${result?.error ? "border-red-500/20" : "border-emerald-500/20"}`}>
          <div className={`px-5 py-4 border-b flex items-center gap-2.5 ${result?.error ? "border-red-500/20 bg-red-500/5" : "border-emerald-500/20 bg-emerald-500/5"}`}>
            {result?.error
              ? <XCircle size={14} className="text-red-400" />
              : <CheckCircle2 size={14} className="text-emerald-400" />
            }
            <span className={`text-sm font-medium ${result?.error ? "text-red-400" : "text-emerald-400"}`}>
              {result?.error ? "Error" : "Success"}
            </span>
          </div>
          <pre className={`p-5 text-xs font-mono overflow-x-auto ${result?.error ? "text-red-400" : "text-emerald-400"}`}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}