"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Width of the drawer panel, default 420px */
  width?: number | string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  width = 420,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Mount guard: ensures server + client both render null on first pass
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed top-0 right-0 z-50 h-full bg-[#0F0F0F] border-l border-zinc-800/60 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/50 shrink-0">
            <span className="text-sm font-semibold text-zinc-200 tracking-tight">
              {title}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              aria-label="Close drawer"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </>,
    document.body
  );
}
