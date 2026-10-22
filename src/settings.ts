import { useEffect, useState } from "react";

export const ACCENTS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];
export const FONTS: Record<string, string> = {
  "Segoe UI": '"Segoe UI", system-ui, sans-serif',
  System: "system-ui, sans-serif",
  Serif: "Georgia, serif",
  Monospace: "Consolas, monospace",
};

export interface Settings {
  gamePath: string | null; // manual override
  theme: string;
  fontFamily: string;
  fontSize: number;
  accent: string;
  defaultLaunch: "vr" | "flatscreen";
  extraArgs: string;
}

const defaults: Settings = {
  gamePath: null, theme: "dark", fontFamily: "Segoe UI", fontSize: 16,
  accent: ACCENTS[0], defaultLaunch: "vr", extraArgs: "",
};

const load = (): Settings => {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem("settings") ?? "{}") };
  } catch {
    return defaults;
  }
};

/** Call once (in App); applies appearance settings to the document and persists changes. */
export function useSettings() {
  const [s, setS] = useState(load);
  const set = (p: Partial<Settings>) => setS((o) => ({ ...o, ...p }));

  useEffect(() => {
    try { localStorage.setItem("settings", JSON.stringify(s)); } catch { /* ignore */ }
  }, [s]);
  useEffect(() => {
    const root = document.documentElement;
    const mq = matchMedia("(prefers-color-scheme: light)");
    const apply = () => {
      root.dataset.theme = s.theme === "light" || (s.theme === "system" && mq.matches) ? "light" : "dark";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [s.theme]);
  useEffect(() => { document.documentElement.style.fontSize = `${s.fontSize}px`; }, [s.fontSize]);
  useEffect(() => { document.documentElement.style.setProperty("--font-ui", FONTS[s.fontFamily] ?? FONTS["Segoe UI"]); }, [s.fontFamily]);
  useEffect(() => { document.documentElement.style.setProperty("--c-accent", s.accent); }, [s.accent]);

  return [s, set] as const;
}
