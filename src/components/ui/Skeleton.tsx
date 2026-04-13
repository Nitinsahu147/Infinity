"use client";

import React from "react";

// ─── SkeletonCard ────────────────────────────────────────────────────────────
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-[#111111] border border-zinc-800/60 rounded-xl p-5 flex flex-col gap-4 shadow-sm ${className}`}
      style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-2.5 w-20 rounded bg-zinc-800" />
          <div className="h-7 w-12 rounded bg-zinc-800 mt-1" />
        </div>
        <div className="w-8 h-8 rounded-lg bg-zinc-800" />
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <div className="h-2.5 w-32 rounded bg-zinc-800" />
        <div className="h-2.5 w-24 rounded bg-zinc-800" />
      </div>
    </div>
  );
}

// ─── SkeletonCardGrid ────────────────────────────────────────────────────────
export function SkeletonCardGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ─── SkeletonRow (static widths — no dynamic Tailwind) ──────────────────────
// Using hardcoded class sets so Tailwind v4 doesn't purge them
const ROW_WIDTHS = ["w-40", "w-28", "w-56", "w-20"] as const;

function SkeletonRow() {
  return (
    <tr className="border-b border-zinc-800/40">
      {ROW_WIDTHS.map((w, i) => (
        <td key={i} className="px-5 py-3.5">
          <div className={`h-2.5 ${w} rounded bg-zinc-800`} />
        </td>
      ))}
    </tr>
  );
}

// ─── SkeletonTable ───────────────────────────────────────────────────────────
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="bg-[#111111] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm"
      style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
    >
      {/* Table header bar */}
      <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2.5">
        <div className="h-3.5 w-3.5 rounded bg-zinc-800" />
        <div className="h-3 w-24 rounded bg-zinc-800" />
        <div className="ml-auto h-5 w-14 rounded-full bg-zinc-800" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {["Action", "Entity Type", "Entity ID", "Time"].map((col) => (
                <th key={col} className="px-5 py-3 text-left">
                  <div className="h-2 w-16 rounded bg-zinc-800" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SkeletonKeyCard ─────────────────────────────────────────────────────────
export function SkeletonKeyCard() {
  return (
    <div
      className="bg-[#0A0A0A] border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-3"
      style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="h-3 w-32 rounded bg-zinc-800" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 rounded-full bg-zinc-800" />
          <div className="h-5 w-14 rounded-full bg-zinc-800" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="h-2.5 w-48 rounded bg-zinc-800" />
        <div className="h-2.5 w-36 rounded bg-zinc-800" />
      </div>
      <div className="flex gap-2">
        <div className="h-7 w-20 rounded-lg bg-zinc-800" />
        <div className="h-7 w-16 rounded-lg bg-zinc-800" />
      </div>
    </div>
  );
}
