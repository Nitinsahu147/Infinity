"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  /** optional extra class on the wrapper */
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  onCta,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center gap-4 py-16 px-6 text-center ${className}`}
    >
      {/* Icon bubble */}
      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-sm">
        <Icon size={24} className="text-zinc-500" />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-zinc-300">{title}</p>
        {description && (
          <p className="text-xs text-zinc-500 max-w-[280px] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* CTA */}
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="mt-1 flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-colors"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
