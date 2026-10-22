import { useState, type ComponentType } from "react";
import { Package, Compass, Layers, Settings } from "lucide-react";
import "./App.css";
import TopBar from "./TopBar";
import ModsTab from "./ModsTab";
import SettingsTab from "./SettingsTab";

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
        <TopBar onSettings={() => setTab("Settings")} />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          {tab === "Mods" && <ModsTab />}
          {tab === "Browse" && <Empty icon={Compass} text="Discover mods from the community here." />}
          {tab === "Presets" && <Empty icon={Layers} text="Save and share sets of mods as presets." />}
          {tab === "Settings" && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}
