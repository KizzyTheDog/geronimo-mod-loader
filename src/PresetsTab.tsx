import { useState, type Dispatch, type SetStateAction } from "react";
import { Layers, Plus, FileDown, Copy, Trash2, Check } from "lucide-react";
import type { Mod } from "./sampleMods";
import { Modal, Confirm, btn, field } from "./ui";

type PMod = { id: string; name: string; version: string; enabled: boolean };
interface Preset {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  mods: PMod[];
}

const load = (): Preset[] => {
  try { return JSON.parse(localStorage.getItem("presets") ?? "[]"); } catch { return []; }
};
const encode = (p: Preset) => "GMH1:" + btoa(unescape(encodeURIComponent(JSON.stringify(p))));
const decode = (code: string): Preset | null => {
  try {
    if (!code.trim().startsWith("GMH1:")) return null;
    const p = JSON.parse(decodeURIComponent(escape(atob(code.trim().slice(5)))));
    const ok = typeof p.name === "string" && Array.isArray(p.mods) &&
      p.mods.every((m: PMod) => typeof m?.id === "string" && typeof m.name === "string" && typeof m.enabled === "boolean");
    if (!ok) return null;
    return {
      id: crypto.randomUUID(), name: p.name, description: String(p.description ?? ""), createdAt: Date.now(),
      mods: p.mods.map((m: PMod) => ({ id: m.id, name: m.name, version: String(m.version ?? ""), enabled: m.enabled })),
    };
  } catch { return null; }
};

export default function PresetsTab({ mods, setMods }: { mods: Mod[]; setMods: Dispatch<SetStateAction<Mod[]>> }) {
  const [presets, setPresetsRaw] = useState(load);
  const [modal, setModal] = useState<"save" | "import" | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [applyId, setApplyId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const setPresets = (f: (p: Preset[]) => Preset[]) =>
    setPresetsRaw((p) => {
      const n = f(p);
      try { localStorage.setItem("presets", JSON.stringify(n)); } catch { /* ignore */ }
      return n;
    });
  const close = () => { setModal(null); setName(""); setDesc(""); setCode(""); setErr(""); };

  const save = () => {
    setPresets((p) => [...p, {
      id: crypto.randomUUID(), name: name.trim(), description: desc.trim(), createdAt: Date.now(),
      mods: mods.map(({ id, name, version, enabled }) => ({ id, name, version, enabled })),
    }]);
    close();
  };
  const importCode = () => {
    const p = decode(code);
    if (!p) return setErr("That isn't a valid preset code");
    setPresets((l) => [...l, p]);
    close();
  };
  const exportCode = (p: Preset) =>
    navigator.clipboard.writeText(encode(p)).then(() => {
      setCopied(p.id);
      setTimeout(() => setCopied(null), 1500);
    });

  const applying = presets.find((p) => p.id === applyId);
  const deleting = presets.find((p) => p.id === delId);
  const diff = applying && {
    enable: applying.mods.filter((m) => m.enabled && mods.some((x) => x.id === m.id && !x.enabled)),
    disable: applying.mods.filter((m) => !m.enabled && mods.some((x) => x.id === m.id && x.enabled)),
    missing: applying.mods.filter((m) => !mods.some((x) => x.id === m.id)),
  };
  const apply = () => {
    if (!applying) return;
    const want = new Map(applying.mods.map((m) => [m.id, m.enabled]));
    setMods((ms) => ms.map((m) => (want.has(m.id) ? { ...m, enabled: want.get(m.id)! } : m)));
    setApplyId(null);
  };
  const list = (ms: PMod[]) => ms.map((m) => m.name).join(", ");

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-5 flex gap-3">
        <button className={btn} onClick={() => setModal("save")}><Plus size={16} /> Save current mods as preset</button>
        <button className={btn} onClick={() => setModal("import")}><FileDown size={16} /> Import code</button>
      </div>

      {presets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-muted">
          <Layers size={40} />
          <div className="font-medium text-text">No presets yet</div>
        </div>
      ) : (
        <ul className="space-y-3">
          {presets.map((p) => (
            <li key={p.id} className="flex items-center gap-4 rounded-2xl border border-border bg-panel p-4">
              <div className="min-w-0 flex-1">
                <div className="font-medium">{p.name}</div>
                {p.description && <p className="line-clamp-2 text-sm text-muted">{p.description}</p>}
                <div className="mt-1.5 text-xs text-muted">
                  {p.mods.length} mods · {p.mods.filter((m) => m.enabled).length} enabled · {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button className={btn} onClick={() => setApplyId(p.id)}>Apply</button>
              <button className={btn} onClick={() => exportCode(p)}>
                {copied === p.id ? <Check size={16} /> : <Copy size={16} />} {copied === p.id ? "Copied" : "Export"}
              </button>
              <button className={btn} aria-label={`Delete ${p.name}`} onClick={() => setDelId(p.id)}><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      )}

      {modal === "save" && (
        <Modal title="Save preset" confirmLabel="Save" onClose={close} onConfirm={save} confirmDisabled={!name.trim()}>
          <input autoFocus aria-label="Preset name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={`${field} w-full`} />
          <textarea aria-label="Preset description" placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} className={`${field} mt-3 w-full`} rows={3} />
        </Modal>
      )}
      {modal === "import" && (
        <Modal title="Import preset code" confirmLabel="Import" onClose={close} onConfirm={importCode} confirmDisabled={!code.trim()}>
          <textarea autoFocus aria-label="Preset code" placeholder="GMH1:…" value={code} onChange={(e) => { setCode(e.target.value); setErr(""); }} className={`${field} w-full`} rows={4} />
          {err && <p role="alert" className="mt-2 text-red-400">{err}</p>}
        </Modal>
      )}
      {applying && diff && (
        <Modal title={`Apply "${applying.name}"?`} confirmLabel="Yes" onClose={() => setApplyId(null)} onConfirm={apply}>
          {diff.enable.length + diff.disable.length + diff.missing.length === 0 ? (
            <p>Already matches</p>
          ) : (
            <div className="space-y-2">
              {diff.enable.length > 0 && <p>Enable: {list(diff.enable)}</p>}
              {diff.disable.length > 0 && <p>Disable: {list(diff.disable)}</p>}
              {diff.missing.length > 0 && <p>Missing (not installed, will be installed once online install exists): {list(diff.missing)}</p>}
            </div>
          )}
        </Modal>
      )}
      {deleting && (
        <Confirm title={`Delete ${deleting.name}?`} text="This preset will be removed." confirmLabel="Delete"
          onClose={() => setDelId(null)} onConfirm={() => setPresets((l) => l.filter((p) => p.id !== deleting.id))} />
      )}
    </div>
  );
}
