"use client";

import React, { useState, useEffect } from "react";
import { useEnvironmentStore } from "@/store/useEnvironmentStore";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { FlaskConical, Radio, Search } from "lucide-react";

export function HeaderClientExtras() {
  const { environment, setEnvironment } = useEnvironmentStore();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global Cmd+K / Ctrl+K handler to open the palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Environment Toggle */}
      <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
        <button
          id="env-toggle-test"
          onClick={() => setEnvironment("test")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
            environment === "test"
              ? "bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          aria-pressed={environment === "test"}
        >
          <FlaskConical size={12} />
          Test
        </button>
        <button
          id="env-toggle-live"
          onClick={() => setEnvironment("live")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
            environment === "live"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          aria-pressed={environment === "live"}
        >
          <Radio size={12} />
          Live
        </button>
      </div>

      {/* Command Palette Trigger */}
      <button
        id="cmd-palette-trigger"
        onClick={() => setPaletteOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all group"
        aria-label="Open command palette"
      >
        <Search size={13} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        <span className="hidden md:inline">Search</span>
        <span className="hidden md:inline text-zinc-600 group-hover:text-zinc-500 transition-colors">or press</span>
        <kbd className="hidden md:inline text-[10px] font-medium text-zinc-600 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded group-hover:text-zinc-400 transition-colors">
          ⌘K
        </kbd>
      </button>

      {/* Command Palette Overlay */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </>
  );
}
