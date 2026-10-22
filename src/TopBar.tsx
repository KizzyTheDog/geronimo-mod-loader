import {
  Play, ChevronDown, Plus, FolderOpen, Upload, ListPlus, PackagePlus, FilePlus2, FileDown,
  User, Package, Layers, Bell, Settings, CircleHelp, LogIn, UserPlus,
} from "lucide-react";
import { Menu, Trigger, Item, Sep, iconBtn } from "./ui";

const log = (s: string) => () => console.log(s);

function Avatar({ size }: { size: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent"
    >
      G
    </span>
  );
}

interface Props {
  found: boolean;
  defaultLaunch: "vr" | "flatscreen";
  onLaunch: (flatscreen: boolean) => void;
  onSettings: () => void;
}

export default function TopBar({ found, defaultLaunch, onLaunch, onSettings }: Props) {
  return (
    <header className="flex items-center gap-3 border-b border-border px-6 py-3">
      <button
        onClick={found ? undefined : onSettings}
        className={`inline-flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-1.5 text-xs text-muted ${found ? "cursor-default" : "cursor-pointer hover:text-text"}`}
      >
        <span className={`h-2 w-2 rounded-full ${found ? "bg-green-500" : "bg-muted"}`} />
        {found ? "GERONIMO found" : "GERONIMO not found"}
      </button>
      <div className="flex-1" />

      <div className="flex">
        <button
          disabled={!found}
          onClick={() => onLaunch(defaultLaunch === "flatscreen")}
          className="inline-flex cursor-pointer items-center gap-2 rounded-l-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play size={16} /> Play
        </button>
        <Menu
          trigger={
            <Trigger
              aria-label="Choose launch mode"
              disabled={!found}
              className="inline-flex cursor-pointer items-center rounded-r-lg border-l border-white/25 bg-accent px-2 text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronDown size={16} />
            </Trigger>
          }
        >
          <Item label="VR" onSelect={() => onLaunch(false)} />
          <Item label="Flatscreen (-nohmd)" onSelect={() => onLaunch(true)} />
          <Item label="Safe mode (coming soon)" disabled />
        </Menu>
      </div>

      <Menu
        trigger={
          <Trigger aria-label="Add" className={iconBtn}>
            <Plus size={20} />
          </Trigger>
        }
      >
        <Item icon={FolderOpen} label="Install mod from file/folder…" onSelect={log("install from file")} />
        <Item icon={Upload} label="Upload mod" onSelect={log("upload mod")} />
        <Item icon={ListPlus} label="Upload preset" onSelect={log("upload preset")} />
        <Sep />
        <Item icon={PackagePlus} label="Create mod" onSelect={log("create mod")} />
        <Item icon={FilePlus2} label="Create preset" onSelect={log("create preset")} />
        <Item icon={FileDown} label="Import preset (code/file)" onSelect={log("import preset")} />
      </Menu>

      <Menu
        trigger={
          <Trigger aria-label="Account menu" className="cursor-pointer rounded-full">
            <Avatar size={36} />
          </Trigger>
        }
      >
        <div className="flex items-center gap-3 px-2.5 py-2">
          <Avatar size={40} />
          <div className="leading-tight">
            <div className="text-sm font-semibold">Guest</div>
            <div className="text-xs text-muted">Not signed in</div>
          </div>
        </div>
        <Sep />
        <Item icon={User} label="Your profile" onSelect={log("profile")} />
        <Item icon={Package} label="Your mods" onSelect={log("your mods")} />
        <Item icon={Layers} label="Your presets" onSelect={log("your presets")} />
        <Item icon={Bell} label="Notifications" onSelect={log("notifications")} />
        <Sep />
        <Item icon={Settings} label="Settings" onSelect={onSettings} />
        <Item icon={CircleHelp} label="Help" onSelect={log("help")} />
        <Sep />
        <Item icon={LogIn} label="Sign in" onSelect={log("sign in")} />
        <Item icon={UserPlus} label="Create account" onSelect={log("create account")} />
      </Menu>
    </header>
  );
}
