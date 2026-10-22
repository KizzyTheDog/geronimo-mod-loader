import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import * as Switch from "@radix-ui/react-switch";
import {
  Search, MoreHorizontal, Eye, FolderOpen, Settings, RefreshCw, RotateCw, Link, Flag, Trash2,
} from "lucide-react";
import type { Mod } from "./sampleMods";
import ModPage, { Thumb, Badges } from "./ModPage";
import { Menu, Trigger, Item, Sep, Confirm, iconBtn, field } from "./ui";

const FILTERS = ["All", "Enabled", "Disabled", "Updates", "Problems"] as const;
const SORTS = ["Name", "Recently installed", "Last updated"] as const;

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
