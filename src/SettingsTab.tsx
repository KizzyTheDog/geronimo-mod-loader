import { useState, type ReactNode } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import { invoke } from "@tauri-apps/api/core";
import { FolderOpen } from "lucide-react";
import { Confirm, btn, field } from "./ui";
import { ACCENTS, FONTS, type Settings } from "./settings";

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

export default function SettingsTab({ s, set, detected }: { s: Settings; set: (p: Partial<Settings>) => void; detected: string | null }) {
  const [dialog, setDialog] = useState<"mods" | "hub" | null>(null);
  const [err, setErr] = useState("");
  const { theme, fontFamily: font, fontSize: size, accent } = s;
  const path = s.gamePath ?? detected;

  const browse = async () => {
    const dir = await open({ directory: true });
    if (typeof dir !== "string") return;
    if (await invoke<boolean>("validate_game", { path: dir })) { set({ gamePath: dir }); setErr(""); }
    else setErr("That isn't a GERONIMO folder");
  };

  const danger = "cursor-pointer rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <Card title="Game">
        <Row label="GERONIMO path">
          <span className="truncate text-text" title={path ?? undefined}>{path ?? "Not found"}</span>
        </Row>
        {err && <p role="alert" className="text-red-400">{err}</p>}
        <div className="flex flex-wrap gap-3">
          <button className={btn} onClick={browse}>Browse…</button>
          <button className={btn} onClick={() => { set({ gamePath: null }); setErr(""); }}>Auto-detect</button>
          <button className={btn} disabled={!path} onClick={() => path && openPath(path).catch(console.error)}>
            <FolderOpen size={16} /> Open in File Explorer
          </button>
        </div>
      </Card>

      <Card title="Launch">
        <Row label="Default mode">
          <select aria-label="Default launch mode" value={s.defaultLaunch}
            onChange={(e) => set({ defaultLaunch: e.target.value as Settings["defaultLaunch"] })} className={field}>
            <option value="vr">VR</option><option value="flatscreen">Flatscreen (-nohmd)</option>
          </select>
        </Row>
        <Row label="Extra arguments">
          <input aria-label="Extra launch arguments" placeholder="e.g. -windowed" value={s.extraArgs}
            onChange={(e) => set({ extraArgs: e.target.value })} className={`${field} w-64`} />
        </Row>
      </Card>

      <Card title="Appearance">
        <Row label="Theme">
          <select aria-label="Theme" value={theme} onChange={(e) => set({ theme: e.target.value })} className={field}>
            <option value="dark">Dark</option><option value="light">Light</option><option value="system">System</option>
          </select>
        </Row>
        <Row label="Font family">
          <select aria-label="Font family" value={font} onChange={(e) => set({ fontFamily: e.target.value })} className={field}>
            {Object.keys(FONTS).map((f) => <option key={f}>{f}</option>)}
          </select>
        </Row>
        <Row label={`Font size (${size}px)`}>
          <input type="range" aria-label="Font size" min={12} max={18} value={size}
            onChange={(e) => set({ fontSize: +e.target.value })} className="w-40 accent-accent" />
        </Row>
        <Row label="Accent colour">
          <div className="flex gap-2">
            {ACCENTS.map((c) => (
              <button
                key={c}
                aria-label={`Accent ${c}`}
                aria-pressed={accent === c}
                onClick={() => set({ accent: c })}
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
