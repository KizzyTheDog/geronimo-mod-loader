import { useEffect, useState, type ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import { Confirm, btn, field } from "./ui";

const ACCENTS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];
const FONTS: Record<string, string> = {
  "Segoe UI": '"Segoe UI", system-ui, sans-serif',
  System: "system-ui, sans-serif",
  Serif: "Georgia, serif",
  Monospace: "Consolas, monospace",
};

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="rounded-2xl border border-border bg-panel p-6">
    <h2 className="mb-4 font-semibold">{title}</h2>
    <div className="space-y-4 text-sm">{children}</div>
  </section>
);
const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="flex items-center justify-between gap-4">
    <span className="text-muted">{label}</span>
    {children}
  </label>
);

export default function SettingsTab() {
  const [theme, setTheme] = useState("dark");
  const [font, setFont] = useState("Segoe UI");
  const [size, setSize] = useState(16);
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [dialog, setDialog] = useState<"mods" | "hub" | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const light = theme === "light" || (theme === "system" && matchMedia("(prefers-color-scheme: light)").matches);
      root.dataset.theme = light ? "light" : "dark";
    };
    apply();
    const mq = matchMedia("(prefers-color-scheme: light)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
  useEffect(() => { document.documentElement.style.fontSize = `${size}px`; }, [size]);
  useEffect(() => { document.documentElement.style.setProperty("--font-ui", FONTS[font]); }, [font]);
  useEffect(() => { document.documentElement.style.setProperty("--c-accent", accent); }, [accent]);

  const danger = "cursor-pointer rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <Card title="Game">
        <Row label="GERONIMO path"><span className="text-text">Not set</span></Row>
        <button className={btn} onClick={() => console.log("open in explorer")}>
          <FolderOpen size={16} /> Open in File Explorer
        </button>
      </Card>

      <Card title="Appearance">
        <Row label="Theme">
          <select aria-label="Theme" value={theme} onChange={(e) => setTheme(e.target.value)} className={field}>
            <option value="dark">Dark</option><option value="light">Light</option><option value="system">System</option>
          </select>
        </Row>
        <Row label="Font family">
          <select aria-label="Font family" value={font} onChange={(e) => setFont(e.target.value)} className={field}>
            {Object.keys(FONTS).map((f) => <option key={f}>{f}</option>)}
          </select>
        </Row>
        <Row label={`Font size (${size}px)`}>
          <input type="range" aria-label="Font size" min={12} max={18} value={size}
            onChange={(e) => setSize(+e.target.value)} className="w-40 accent-accent" />
        </Row>
        <Row label="Accent colour">
          <div className="flex gap-2">
            {ACCENTS.map((c) => (
              <button
                key={c}
                aria-label={`Accent ${c}`}
                aria-pressed={accent === c}
                onClick={() => setAccent(c)}
                style={{ background: c }}
                className={`h-7 w-7 cursor-pointer rounded-full ${accent === c ? "ring-2 ring-text ring-offset-2 ring-offset-panel" : ""}`}
              />
            ))}
          </div>
        </Row>
      </Card>

      <Card title="Uninstall">
        <div className="flex flex-wrap gap-3">
          <button className={danger} onClick={() => setDialog("mods")}>Uninstall all mods / loaders</button>
          <button className={danger} onClick={() => setDialog("hub")}>Uninstall GERONIMO Mod Hub</button>
        </div>
      </Card>

      {dialog === "mods" && (
        <Confirm title="Uninstall all mods / loaders?" text="Every installed mod and mod loader will be removed from GERONIMO."
          confirmLabel="Uninstall all" onClose={() => setDialog(null)} onConfirm={() => console.log("uninstall all mods")} />
      )}
      {dialog === "hub" && (
        <Confirm title="Uninstall GERONIMO Mod Hub?" text="This removes the Hub from your computer. Type UNINSTALL to confirm."
          confirmLabel="Uninstall Hub" typeWord="UNINSTALL" onClose={() => setDialog(null)} onConfirm={() => console.log("uninstall hub")} />
      )}
    </div>
  );
}
