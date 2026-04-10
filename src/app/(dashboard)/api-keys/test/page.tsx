"use client";

import { useState } from "react";
import { Key, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from "lucide-react";

export default function ApiKeyTestPage() {
  const [apiKey, setApiKey] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/api-keys/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !apiKey;

  const getResultState = () => {
    if (result?.error) return "error";
    if (result?.valid === false) return "invalid";
    if (result !== null) return "valid";
    return null;
  };

  const state = getResultState();

  const resultStyles = {
    error: {
      border: "border-red-500/20",
      headerBg: "bg-red-500/5 border-red-500/20",
      icon: <XCircle size={14} className="text-red-400" />,
      label: "Verification Failed",
      labelColor: "text-red-400",
    },
    invalid: {
      border: "border-amber-500/20",
      headerBg: "bg-amber-500/5 border-amber-500/20",
      icon: <AlertTriangle size={14} className="text-amber-400" />,
      label: "Invalid Key",
      labelColor: "text-amber-400",
    },
    valid: {
      border: "border-emerald-500/20",
      headerBg: "bg-emerald-500/5 border-emerald-500/20",
      icon: <CheckCircle2 size={14} className="text-emerald-400" />,
      label: "Key Verified",
      labelColor: "text-emerald-400",
    },
  };

  return (
    <div className="flex flex-col gap-8 max-w-[720px]">

      {/* Page header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Test API Key</h1>
        <p className="text-sm text-zinc-400">
          Paste an API key below to verify its validity and inspect its metadata.
        </p>
      </div>

      {/* Input card */}
      <div className="bg-[#111111] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2.5">
          <Key size={14} className="text-zinc-400" />
          <span className="text-sm font-medium text-zinc-200">Verify API Key</span>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-400">API Key</label>
            <input
              type="text"
              placeholder="Paste your API key here..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 font-mono outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-colors"
            />
            <p className="text-xs text-zinc-600">
              The key will be sent to the verification endpoint and never stored.
            </p>
          </div>

          <button
            onClick={handleVerify}
            disabled={isDisabled}
            className="self-start flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 bg-zinc-100 text-zinc-900 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {loading ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className="animate-spin">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck size={13} />
                Verify API Key
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result card */}
      {result !== null && state && (
        <div className={`bg-[#111111] border rounded-xl overflow-hidden shadow-sm ${resultStyles[state].border}`}>
          <div className={`px-5 py-4 border-b flex items-center gap-2.5 ${resultStyles[state].headerBg}`}>
            {resultStyles[state].icon}
            <span className={`text-sm font-medium ${resultStyles[state].labelColor}`}>
              {resultStyles[state].label}
            </span>
          </div>

          <div className="p-5">
            {result?.error ? (
              <p className="text-sm text-red-400">{result.error}</p>
            ) : (
              <pre className="text-xs text-zinc-300 font-mono bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 overflow-x-auto leading-relaxed">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

    </div>
  );
}