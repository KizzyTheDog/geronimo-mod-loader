import { useEffect, useState, type ComponentType } from "react";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Package, Compass, Layers, Settings } from "lucide-react";
import "./App.css";
import TopBar from "./TopBar";
import ModsTab from "./ModsTab";
import SettingsTab from "./SettingsTab";
import PresetsTab from "./PresetsTab";
import { useSettings } from "./settings";
import { sampleMods } from "./sampleMods";

const TABS = [
  { id: "Mods", icon: Package },
  { id: "Browse", icon: Compass },
  { id: "Presets", icon: Layers },
  { id: "Settings", icon: Settings },
] as const;
type Tab = (typeof TABS)[number]["id"];

function Empty({ icon: I, text }: { icon: ComponentType<{ size?: number }>; text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border text-muted">
      <I size={40} />
      <div className="font-medium text-text">Coming soon</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("Mods");
  const [settings, set] = useSettings();
  const [mods, setMods] = useState(sampleMods);
  const [detected, setDetected] = useState<string | null>(null);
  useEffect(() => { invoke<string | null>("detect_game").then(setDetected).catch(() => {}); }, []);
  const gamePath = settings.gamePath ?? detected;

  const launch = (flatscreen: boolean) => {
    const args = [flatscreen ? "-nohmd" : "", settings.extraArgs.trim()].filter(Boolean).join(" ").replace(/ /g, "%20");
    openUrl(`steam://run/2019620//${args}/`).catch(console.error);
  };
  return (
    <div className="flex h-screen bg-bg text-text">
      <aside className="flex w-56 shrink-0 flex-col gap-1 border-r border-border p-4">
        <div className="mb-6 px-3 py-2 text-lg font-bold tracking-tight">
          GERONIMO <span className="text-accent">Hub</span>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Main">
          {TABS.map(({ id, icon: I }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                tab === id ? "bg-accent/15 text-accent" : "text-muted hover:bg-white/5 hover:text-text"
              }`}
            >
              <I size={18} /> {id}
            </button>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          found={!!gamePath}
          defaultLaunch={settings.defaultLaunch}
          onLaunch={launch}
          onSettings={() => setTab("Settings")}
        />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          {tab === "Mods" && <ModsTab mods={mods} setMods={setMods} />}
          {tab === "Browse" && <Empty icon={Compass} text="Discover mods from the community here." />}
          {tab === "Presets" && <PresetsTab mods={mods} setMods={setMods} />}
          {tab === "Settings" && <SettingsTab s={settings} set={set} detected={detected} />}
        </main>
      </div>
    </div>
  );
}
