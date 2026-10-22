import { useState, type ReactNode, type ComponentType } from "react";
import * as Dd from "@radix-ui/react-dropdown-menu";
import { X } from "lucide-react";

type Icon = ComponentType<{ size?: number; className?: string }>;

export const iconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-text cursor-pointer";
export const btn =
  "inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-white/5 cursor-pointer";
export const field =
  "rounded-lg border border-border bg-panel px-3 py-2 text-sm text-text placeholder:text-muted";

export const menuPanel =
  "z-50 min-w-56 rounded-xl border border-border bg-panel p-1.5 shadow-2xl shadow-black/40";
const itemCls =
  "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none data-[highlighted]:bg-white/10";

export function Item({ icon: I, label, onSelect, danger, disabled }: { icon?: Icon; label: string; onSelect?: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <Dd.Item onSelect={onSelect} disabled={disabled} className={`${itemCls} ${danger ? "text-red-400" : ""} data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40`}>
      {I && <I size={16} className={danger ? "" : "text-muted"} />}
      {label}
    </Dd.Item>
  );
}

export const Sep = () => <Dd.Separator className="my-1.5 h-px bg-border" />;

export function Menu({ trigger, children, align = "end" }: { trigger: ReactNode; children: ReactNode; align?: "end" | "start" }) {
  return (
    <Dd.Root>
      {trigger}
      <Dd.Portal>
        <Dd.Content align={align} sideOffset={8} className={menuPanel}>
          {children}
        </Dd.Content>
      </Dd.Portal>
    </Dd.Root>
  );
}
export const Trigger = Dd.Trigger;

export function Modal({
  title, children, confirmLabel, onConfirm, onClose, confirmDisabled, danger,
}: { title: string; children: ReactNode; confirmLabel: string; onConfirm: () => void; onClose: () => void; confirmDisabled?: boolean; danger?: boolean }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-2xl border border-border bg-panel p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button aria-label="Close dialog" className={iconBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div className="mb-6 text-sm text-muted">{children}</div>
        <div className="flex justify-end gap-2">
          <button className={btn} onClick={onClose}>Cancel</button>
          <button
            autoFocus={danger}
            disabled={confirmDisabled}
            onClick={onConfirm}
            className={`rounded-lg ${danger ? "bg-red-600 hover:bg-red-500" : "bg-accent hover:brightness-110"} px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Confirm dialog; if `typeWord` is set, the user must type it to enable confirm. */
export function Confirm({ title, text, confirmLabel, typeWord, onConfirm, onClose }: {
  title: string; text: string; confirmLabel: string; typeWord?: string; onConfirm: () => void; onClose: () => void;
}) {
  const [typed, setTyped] = useState("");
  return (
    <Modal
      danger
      title={title}
      confirmLabel={confirmLabel}
      onClose={onClose}
      onConfirm={() => { onConfirm(); onClose(); }}
      confirmDisabled={!!typeWord && typed !== typeWord}
    >
      <p>{text}</p>
      {typeWord && (
        <input
          aria-label={`Type ${typeWord} to confirm`}
          placeholder={`Type ${typeWord} to confirm`}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className={`${field} mt-4 w-full`}
        />
      )}
    </Modal>
  );
}
