"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEnvironmentStore } from "@/store/useEnvironmentStore";
import {
  LayoutDashboard,
  Key,
  FileText,
  TerminalSquare,
  FlaskConical,
  Radio,
  Zap,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

function CommandPaletteContent({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { environment, toggleEnvironment } = useEnvironmentStore();
  const [search, setSearch] = useState("");
  // Mount guard: ensures server + client both render null on first pass
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Reset search on open
  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  const run = useCallback(
    (action: () => void) => {
      action();
      onClose();
    },
    [onClose]
  );

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={15} />,
      group: "Navigate",
      action: () => router.push("/dashboard"),
    },
    {
      id: "api-keys",
      label: "API Keys",
      icon: <Key size={15} />,
      group: "Navigate",
      action: () => router.push("/api-keys"),
    },
    {
      id: "audit-logs",
      label: "Audit Logs",
      icon: <FileText size={15} />,
      group: "Navigate",
      action: () => router.push("/audit-logs"),
    },
    {
      id: "workbench",
      label: "Go to Workbench",
      icon: <TerminalSquare size={15} />,
      group: "Navigate",
      action: () => router.push("/api-keys/test"),
    },
  ];

  const actionItems = [
    {
      id: "create-key",
      label: "Create API Key",
      icon: <Zap size={15} />,
      group: "Actions",
      action: () => router.push("/api-keys"),
    },
    {
      id: "toggle-env",
      label: `Switch to ${environment === "test" ? "Live" : "Test"} Mode`,
      icon: environment === "test" ? <Radio size={15} /> : <FlaskConical size={15} />,
      group: "Actions",
      action: toggleEnvironment,
    },
  ];

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
      style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-[560px] mx-4 rounded-2xl border border-zinc-700/60 bg-[#111111] shadow-2xl overflow-hidden"
        style={{
          transform: open ? "scale(1) translateY(0)" : "scale(0.97) translateY(-8px)",
          transition: "transform 0.15s ease, opacity 0.15s ease",
        }}
      >
        <Command
          label="Command Palette"
          shouldFilter={true}
          className="flex flex-col"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-zinc-500 shrink-0"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search commands…"
              className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none"
              autoFocus
            />
            <kbd className="shrink-0 text-[10px] font-medium text-zinc-500 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded select-none">
              ESC
            </kbd>
          </div>

          {/* Command list */}
          <Command.List className="max-h-[320px] overflow-y-auto py-2">
            <Command.Empty className="py-10 text-center text-sm text-zinc-500">
              No results found.
            </Command.Empty>

            {/* Navigate group */}
            <Command.Group
              heading="Navigate"
              className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-zinc-500 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest"
            >
              {navItems.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.label}
                  onSelect={() => run(item.action)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 cursor-pointer rounded-lg mx-1 transition-colors
                    data-[selected=true]:bg-zinc-800 data-[selected=true]:text-zinc-100
                    hover:bg-zinc-800/60"
                >
                  <span className="text-zinc-500">{item.icon}</span>
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>

            {/* Actions group */}
            <Command.Group
              heading="Actions"
              className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-zinc-500 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest mt-1"
            >
              {actionItems.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.label}
                  onSelect={() => run(item.action)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 cursor-pointer rounded-lg mx-1 transition-colors
                    data-[selected=true]:bg-zinc-800 data-[selected=true]:text-zinc-100
                    hover:bg-zinc-800/60"
                >
                  <span className="text-zinc-500">{item.icon}</span>
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          {/* Footer hint */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-zinc-800/50">
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-600">
              <kbd className="bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-[10px]">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-600">
              <kbd className="bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-[10px]">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-600">
              <kbd className="bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-[10px]">ESC</kbd>
              Close
            </span>
          </div>
        </Command>
      </div>
    </div>,
    document.body
  );
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) {
          onClose();
        } else {
          // The opener is managed by the parent; we just prevent default here
          // Parent component toggles `open` on its own handler
        }
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return <CommandPaletteContent open={open} onClose={onClose} />;
}
