import { useEffect, useState } from "react";
import { BadgeCheck, ArrowLeft, TriangleAlert, Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Mod, Media } from "./sampleMods";
import { youtubeId } from "./youtube";

export const gradient = (name: string) => {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `linear-gradient(135deg, hsl(${h} 70% 55%), hsl(${(h + 50) % 360} 70% 35%))`;
};

export function Thumb({ name, size = 48 }: { name: string; size?: number }) {
  return (
    <div
      style={{ background: gradient(name), width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
    >
      {name[0]}
    </div>
  );
}

export function Badges({ mod }: { mod: Mod }) {
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

const ytThumb = (url: string) => `https://img.youtube.com/vi/${youtubeId(url)}/hqdefault.jpg`;

function Slide({ m, big }: { m: Media; big?: boolean }) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => setPlaying(false), [m]);
  const cls = "h-full w-full object-contain";
  if (m.type === "image") return <img src={m.url} alt="" className={cls} />;
  if (m.type === "video") return <video src={m.url} controls className={cls} />;
  const id = youtubeId(m.url);
  if (!id) return null;
  if (playing && big)
    return <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} title="YouTube video" allow="autoplay; encrypted-media; fullscreen" allowFullScreen className="h-full w-full" />;
  return (
    <button onClick={() => setPlaying(true)} aria-label="Play video" className="relative h-full w-full cursor-pointer">
      <img src={ytThumb(m.url)} alt="" className="h-full w-full object-cover" />
      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
        <Play size={big ? 48 : 20} className="text-white" fill="currentColor" />
      </span>
    </button>
  );
}

function Gallery({ media }: { media: Media[] }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const n = media.length;
  const go = (d: number) => setI((x) => (x + d + n) % n);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  const m = media[i];
  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
        <Slide m={m} big />
        <button onClick={() => setOpen(true)} className="absolute right-2 top-2 cursor-pointer rounded-lg bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80">
          Enlarge
        </button>
      </div>
      {n > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {media.map((t, j) => (
            <button key={j} onClick={() => setI(j)} aria-label={`Show media ${j + 1}`}
              className={`relative h-14 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-black ${j === i ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"}`}>
              {t.type === "image" ? <img src={t.url} alt="" className="h-full w-full object-cover" />
                : t.type === "youtube" ? <img src={ytThumb(t.url)} alt="" className="h-full w-full object-cover" />
                : <video src={t.url} preload="metadata" muted className="h-full w-full object-cover" />}
              {t.type !== "image" && <Play size={16} fill="currentColor" className="absolute inset-0 m-auto text-white drop-shadow" />}
            </button>
          ))}
        </div>
      )}
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Media viewer" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6" onClick={() => setOpen(false)}>
          <div className="aspect-video max-h-full w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Slide m={m} big />
          </div>
          <button aria-label="Close" onClick={() => setOpen(false)} className="absolute right-4 top-4 cursor-pointer text-white"><X size={28} /></button>
          {n > 1 && <>
            <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-4 cursor-pointer text-white"><ChevronLeft size={36} /></button>
            <button aria-label="Next" onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-4 cursor-pointer text-white"><ChevronRight size={36} /></button>
          </>}
        </div>
      )}
    </div>
  );
}

export default function ModPage({ mod, onBack }: { mod: Mod; onBack: () => void }) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <button onClick={onBack} className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm text-muted hover:text-text">
        <ArrowLeft size={16} /> Back
      </button>
      {mod.media?.length ? <Gallery media={mod.media} /> : <div className="h-36 rounded-2xl" style={{ background: gradient(mod.name) }} />}
      <div className="mt-6 flex items-center gap-4">
        <Thumb name={mod.name} size={64} />
        <div>
          <h1 className="text-2xl font-semibold">{mod.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>by {mod.author}</span><span>{/^d/.test(mod.version) ? `v${mod.version}` : mod.version}</span><Badges mod={mod} />
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
