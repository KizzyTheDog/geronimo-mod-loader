export type ModType = "GML" | "UE4SS" | "Pak";

export type Media = { type: "image" | "video" | "youtube"; url: string };

export interface Mod {
  id: string;
  name: string;
  description: string;
  version: string;
  type: ModType;
  author: string;
  verified: boolean;
  enabled: boolean;
  installed: number; // epoch ms
  updated: number;
  hasUpdate?: boolean;
  problem?: boolean;
  dependencies: string[];
  media?: Media[];
}

const d = (n: number) => Date.now() - n * 864e5;

export const sampleMods: Mod[] = [
  { id: "flatscreen", name: "GeronimoFlatscreen", description: "Play GERONIMO without VR: mouse/keyboard flight, menus, upscaling and more.", version: "0.1.7", type: "UE4SS", author: "KizzyTheDog", verified: true, enabled: true, installed: d(2), updated: d(1), dependencies: [] },
  { id: "hud", name: "Clean HUD", description: "Declutters the cockpit HUD and adds an optional minimal altimeter and speed readout.", version: "1.2.0", type: "GML", author: "skyfox", verified: true, enabled: true, installed: d(20), updated: d(8), hasUpdate: true, dependencies: [], media: [ { type: "image", url: "https://picsum.photos/seed/hud1/960/540" }, { type: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }, { type: "image", url: "https://picsum.photos/seed/hud2/960/540" } ] },
  { id: "weather", name: "Storm Chaser", description: "Adds dynamic storms, fog banks and turbulence to every mission. Requires the Sky Library to function.", version: "0.9.3", type: "GML", author: "nimbus", verified: false, enabled: false, installed: d(5), updated: d(5), dependencies: ["Sky Library 2.x", "GeronimoFlatscreen"], media: [ { type: "image", url: "https://picsum.photos/seed/storm1/960/540" }, { type: "image", url: "https://picsum.photos/seed/storm2/960/540" } ] },
  { id: "skins", name: "Desert Camo Pack", description: "Six new aircraft liveries in desert tones, packaged as a texture pak.", version: "2.0.0", type: "Pak", author: "paintshop", verified: false, enabled: true, installed: d(40), updated: d(30), dependencies: [], media: [ { type: "image", url: "https://picsum.photos/seed/camo1/960/540" }, { type: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" } ] },
  { id: "radio", name: "Better Radio Chatter", description: "Replaces the stock radio lines with longer, varied chatter and adds squelch effects.", version: "1.0.4", type: "UE4SS", author: "wingman", verified: true, enabled: false, installed: d(12), updated: d(12), problem: true, dependencies: [] },
  { id: "skylib", name: "Sky Library", description: "Shared helper library used by weather and sky mods. Does nothing on its own.", version: "2.1.0", type: "GML", author: "nimbus", verified: true, enabled: true, installed: d(5), updated: d(3), dependencies: [] },
];
