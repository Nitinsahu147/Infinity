import { create } from "zustand";
import { persist } from "zustand/middleware";

type Environment = "test" | "live";

interface EnvironmentStore {
  isTestMode: boolean;
  environment: Environment;
  toggleEnvironment: () => void;
  setEnvironment: (env: Environment) => void;
}

export const useEnvironmentStore = create<EnvironmentStore>()(
  persist(
    (set, get) => ({
      isTestMode: true,
      environment: "test",
      toggleEnvironment: () => {
        const next: Environment = get().environment === "test" ? "live" : "test";
        set({ environment: next, isTestMode: next === "test" });
      },
      setEnvironment: (env: Environment) => {
        set({ environment: env, isTestMode: env === "test" });
      },
    }),
    {
      name: "vyorai-environment",
    }
  )
);
