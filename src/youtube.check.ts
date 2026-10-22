import { youtubeId } from "./youtube";

const eq = (a: unknown, b: unknown, m = "") => { if (a !== b) throw new Error(`${m}: got ${a}, want ${b}`); };

const id = "dQw4w9WgXcQ";
for (const u of [
  `https://www.youtube.com/watch?v=${id}&t=5s`,
  `https://youtu.be/${id}?si=x`,
  `https://www.youtube.com/shorts/${id}`,
  `https://www.youtube.com/embed/${id}`,
]) eq(youtubeId(u), id, u);
eq(youtubeId("https://vimeo.com/12345678901"), null);
eq(youtubeId("not a url"), null);
console.log("youtube ok");
