import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add("light-mode");
  } else {
    root.classList.remove("light-mode");
  }
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "dark",
      toggleTheme: () => {
        const next: Theme = get().theme === "dark" ? "light" : "dark";
        set({ theme: next });
        applyTheme(next);
      },
      setTheme: (theme: Theme) => {
        set({ theme });
        applyTheme(theme);
      },
    }),
    {
      name: "vyorai-theme",
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);
