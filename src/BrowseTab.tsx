import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, LayoutGrid, List, Download, RefreshCw, Loader2 } from "lucide-react";
import type { Mod } from "./sampleMods";
import ModPage, { Thumb, Badges } from "./ModPage";
import { btn, field } from "./ui";

const URL = "https://raw.githubusercontent.com/RemArrow/geronimo-mod-loader/main/catalog.json";

// Catalog schema: { version, mods: [{ guid, name, author, description, repo, asset, credits?, minGml?, tags[] }] }.
// No versions or dates in the catalog, so sorting is by name only and version is shown as "latest".
interface Entry { guid: string; name: string; author: string; description: string; repo?: string; tags?: string[] }

const toMod = (e: Entry): Mod => ({
  id: e.guid, name: e.name, author: e.author, description: e.description, version: "latest",
  type: "GML", verified: false, enabled: false, installed: 0, updated: 0, dependencies: [],
});

const Install = ({ className = "" }: { className?: string }) => (
  <button disabled title="Install comes in a later update" onClick={(e) => e.stopPropagation()}
    className={`${btn} shrink-0 cursor-not-allowed opacity-50 hover:bg-transparent ${className}`}>
    <Download size={16} /> Install
  </button>
);

export default function BrowseTab() {
  const [mods, setMods] = useState<Mod[] | null>(null);
  const [err, setErr] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"Name" | "Name (Z-A)">("Name");
  const [grid, setGrid] = useState(true);
  const [viewId, setViewId] = useState<string | null>(null);

  const load = useCallback(() => {
    setMods(null); setErr(false);
    fetch(URL)
      .then((r) => { if (!r.ok) throw 0; return r.json(); })
      .then((j: { mods: Entry[] }) => setMods(j.mods.map(toMod)))
      .catch(() => setErr(true));
  }, []);
  useEffect(load, [load]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    const r = (mods ?? []).filter((m) => !s || (m.name + m.description + m.author).toLowerCase().includes(s))
      .sort((a, b) => a.name.localeCompare(b.name));
    return sort === "Name" ? r : r.reverse();
  }, [mods, q, sort]);

  const viewing = mods?.find((m) => m.id === viewId);
  if (viewing) return <ModPage mod={viewing} onBack={() => setViewId(null)} />;

  if (err)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted">
        <div className="font-medium text-text">Couldn't load the catalog</div>
        <button onClick={load} className={btn}><RefreshCw size={16} /> Retry</button>
      </div>
    );
  if (!mods)
    return <div className="flex h-full items-center justify-center gap-2 text-muted"><Loader2 className="animate-spin" size={18} /> Loading catalog…</div>;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input aria-label="Search catalog" placeholder="Search catalog" value={q} onChange={(e) => setQ(e.target.value)} className={`${field} w-full pl-9`} />
        </div>
        <select aria-label="Sort catalog" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={field}>
          <option>Name</option><option>Name (Z-A)</option>
        </select>
        <div className="flex overflow-hidden rounded-lg border border-border">
          {[[true, LayoutGrid, "Grid view"], [false, List, "List view"]].map(([g, I, label]) => {
            const Icon = I as typeof List;
            return (
              <button key={label as string} aria-label={label as string} aria-pressed={grid === g} onClick={() => setGrid(g as boolean)}
                className={`cursor-pointer px-3 py-2 ${grid === g ? "bg-accent/15 text-accent" : "text-muted hover:bg-white/5"}`}>
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </div>
      <ul className={`flex-1 overflow-y-auto pr-1 ${grid ? "grid content-start gap-3 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}`}>
        {shown.length === 0 && <li className="col-span-full py-16 text-center text-sm text-muted">{mods.length ? "No mods match." : "The catalog is empty."}</li>}
        {shown.map((m) => (
          <li key={m.id}>
            <div role="button" tabIndex={0} onClick={() => setViewId(m.id)} onKeyDown={(e) => e.key === "Enter" && setViewId(m.id)}
              className={`flex h-full cursor-pointer gap-4 rounded-2xl border border-border bg-panel p-4 hover:border-accent/50 ${grid ? "flex-col" : "items-center"}`}>
              <div className="flex min-w-0 flex-1 gap-4">
                <Thumb name={m.name} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{m.name}</div>
                  <p className="line-clamp-2 text-sm text-muted">{m.description}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span>by {m.author}</span><Badges mod={m} />
                  </div>
                </div>
              </div>
              <Install className={grid ? "self-end" : ""} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
