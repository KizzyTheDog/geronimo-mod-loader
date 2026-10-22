import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import * as Switch from "@radix-ui/react-switch";
import {
  Search, MoreHorizontal, Eye, FolderOpen, Settings, RefreshCw, RotateCw, Link, Flag, Trash2,
  BadgeCheck, ArrowLeft, TriangleAlert,
} from "lucide-react";
import type { Mod } from "./sampleMods";
import { Menu, Trigger, Item, Sep, Confirm, iconBtn, field } from "./ui";

const FILTERS = ["All", "Enabled", "Disabled", "Updates", "Problems"] as const;
const SORTS = ["Name", "Recently installed", "Last updated"] as const;

const gradient = (name: string) => {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `linear-gradient(135deg, hsl(${h} 70% 55%), hsl(${(h + 50) % 360} 70% 35%))`;
};

function Thumb({ name, size = 48 }: { name: string; size?: number }) {
  return (
    <div
      style={{ background: gradient(name), width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
    >
      {name[0]}
    </div>
  );
}

function Badges({ mod }: { mod: Mod }) {
  return (
    <>
      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-medium text-text">{mod.type}</span>
      {mod.verified ? (
        <span className="inline-flex items-center gap-1 rounded bg-accent/15 px-1.5 py-0.5 text-[11px] font-medium text-accent">
          <BadgeCheck size={12} /> Verified
        </span>
      ) : (
        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-medium text-amber-400">Unverified</span>
      )}
    </>
  );
}

function ModPage({ mod, onBack }: { mod: Mod; onBack: () => void }) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <button onClick={onBack} className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm text-muted hover:text-text">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="h-36 rounded-2xl" style={{ background: gradient(mod.name) }} />
      <div className="mt-6 flex items-center gap-4">
        <Thumb name={mod.name} size={64} />
        <div>
          <h1 className="text-2xl font-semibold">{mod.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>by {mod.author}</span><span>v{mod.version}</span><Badges mod={mod} />
          </div>
        </div>
      </div>
      {!mod.verified && (
        <div role="alert" className="mt-6 flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-300">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" />
          <p>
            <b>⚠ Unverified</b> — this mod hasn't been reviewed by the Hub admins. Its contents might not be safe. Use at your own risk.
          </p>
        </div>
      )}
      <section className="mt-6 rounded-2xl border border-border bg-panel p-6">
        <h2 className="mb-2 font-semibold">Description</h2>
        <p className="text-sm text-muted">{mod.description}</p>
      </section>
      <section className="mt-4 rounded-2xl border border-border bg-panel p-6">
        <h2 className="mb-2 font-semibold">Dependencies</h2>
        {mod.dependencies.length ? (
          <ul className="list-inside list-disc text-sm text-muted">
            {mod.dependencies.map((d) => <li key={d}>{d}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-muted">No dependencies</p>
        )}
      </section>
    </div>
  );
}

export default function ModsTab({ mods, setMods }: { mods: Mod[]; setMods: Dispatch<SetStateAction<Mod[]>> }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Name");
  const [viewId, setViewId] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const shown = useMemo(() => {
    const ok: Record<string, (m: Mod) => boolean> = {
      All: () => true, Enabled: (m) => m.enabled, Disabled: (m) => !m.enabled,
      Updates: (m) => !!m.hasUpdate, Problems: (m) => !!m.problem,
    };
    const s = q.trim().toLowerCase();
    return mods
      .filter((m) => ok[filter](m) && (!s || (m.name + m.description + m.author).toLowerCase().includes(s)))
      .sort((a, b) =>
        sort === "Name" ? a.name.localeCompare(b.name)
        : sort === "Recently installed" ? b.installed - a.installed
        : b.updated - a.updated);
  }, [mods, q, filter, sort]);

  const viewing = mods.find((m) => m.id === viewId);
  if (viewing) return <ModPage mod={viewing} onBack={() => setViewId(null)} />;

  const toggle = (id: string, enabled: boolean) =>
    setMods((ms) => ms.map((m) => (m.id === id ? { ...m, enabled } : m)));
  const log = (s: string, m: Mod) => () => console.log(s, m.name);
  const removing = mods.find((m) => m.id === removeId);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            aria-label="Search mods"
            placeholder="Search mods"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={`${field} w-full pl-9`}
          />
        </div>
        <select aria-label="Filter mods" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className={field}>
          {FILTERS.map((f) => <option key={f}>{f}</option>)}
        </select>
        <select aria-label="Sort mods" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={field}>
          {SORTS.map((f) => <option key={f}>{f}</option>)}
        </select>
      </div>

      <ul className="flex-1 space-y-3 overflow-y-auto pr-1">
        {shown.length === 0 && <li className="py-16 text-center text-sm text-muted">No mods match.</li>}
        {shown.map((m) => (
          <li key={m.id} className="flex items-center gap-4 rounded-2xl border border-border bg-panel p-4">
            <Thumb name={m.name} />
            <div className="min-w-0 flex-1">
              <div className="font-medium">{m.name}</div>
              <p className="line-clamp-2 text-sm text-muted">{m.description}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>v{m.version}</span><Badges mod={m} /><span>by {m.author}</span>
              </div>
            </div>
            <Menu
              trigger={<Trigger aria-label={`More actions for ${m.name}`} className={iconBtn}><MoreHorizontal size={18} /></Trigger>}
            >
              <Item icon={Eye} label="View" onSelect={() => setViewId(m.id)} />
              <Item icon={FolderOpen} label="Open in Explorer" onSelect={log("explorer", m)} />
              <Item icon={Settings} label="Settings" onSelect={log("settings", m)} />
              <Item icon={RefreshCw} label="Check for update" onSelect={log("update", m)} />
              <Item icon={RotateCw} label="Reinstall" onSelect={log("reinstall", m)} />
              <Item icon={Link} label="Copy share link" onSelect={log("share", m)} />
              <Item icon={Flag} label="Report" onSelect={log("report", m)} />
              <Sep />
              <Item icon={Trash2} label="Uninstall" danger onSelect={() => setRemoveId(m.id)} />
            </Menu>
            <Switch.Root
              checked={m.enabled}
              onCheckedChange={(v) => toggle(m.id, v)}
              aria-label={`${m.enabled ? "Disable" : "Enable"} ${m.name}`}
              className="h-6 w-11 shrink-0 cursor-pointer rounded-full bg-white/15 transition-colors data-[state=checked]:bg-accent"
            >
              <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
          </li>
        ))}
      </ul>

      {removing && (
        <Confirm
          title={`Uninstall ${removing.name}?`}
          text="This removes the mod from your game. You can reinstall it later."
          confirmLabel="Uninstall"
          onClose={() => setRemoveId(null)}
          onConfirm={() => setMods((ms) => ms.filter((m) => m.id !== removing.id))}
        />
      )}
    </div>
  );
}
