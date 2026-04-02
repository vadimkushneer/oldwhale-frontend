import type { ScriptBlock } from "./scriptBlock";

export interface SceneItem {
  id: number;
  actNum?: number;
  subNum?: number;
  num: number;
  text: string;
  cast: string;
  index: number;
  kind: "scene" | "act";
}

export function getScenes(blocks: ScriptBlock[], mode: string): SceneItem[] {
  const scenes: SceneItem[] = [];
  let actNum = 0;
  let sceneNum = 0;
  let sceneInAct = 0;
  blocks.forEach((b, i) => {
    if (mode === "play") {
      if (b.type === "act") {
        actNum++;
        sceneInAct = 0;
        scenes.push({
          id: b.id,
          actNum,
          num: actNum,
          text: b.text,
          cast: "",
          index: i,
          kind: "act",
        });
      } else if (b.type === "scene") {
        sceneNum++;
        sceneInAct++;
        const cast = blocks[i + 1]?.type === "cast" ? blocks[i + 1].text : "";
        const label = b.text || "Сцена " + sceneInAct;
        scenes.push({
          id: b.id,
          actNum,
          subNum: sceneInAct,
          num: sceneNum,
          text: label,
          cast,
          index: i,
          kind: "scene",
        });
      }
    } else if (mode === "media") {
      if (b.type === "segment") {
        actNum++;
        sceneInAct = 0;
        scenes.push({
          id: b.id,
          actNum,
          num: actNum,
          text: b.text,
          cast: "",
          index: i,
          kind: "act",
        });
      } else if (
        ["anchor", "sync", "vtr", "offscreen", "lower3", "question", "note"].includes(b.type)
      ) {
        sceneNum++;
        sceneInAct++;
        scenes.push({
          id: b.id,
          actNum,
          subNum: sceneInAct,
          num: sceneNum,
          text: b.text || b.type,
          cast: "",
          index: i,
          kind: "scene",
        });
      }
    } else {
      if (b.type === "scene") {
        sceneNum++;
        const cast = blocks[i + 1]?.type === "cast" ? blocks[i + 1].text : "";
        scenes.push({
          id: b.id,
          num: sceneNum,
          text: b.text,
          cast,
          index: i,
          kind: "scene",
        });
      } else if (b.type === "video") {
        actNum++;
        sceneInAct = 0;
        scenes.push({
          id: b.id,
          actNum,
          num: actNum,
          text: b.text || "Видео " + actNum,
          cast: "",
          index: i,
          kind: "act",
        });
      } else if (["hook", "body", "cta"].includes(b.type)) {
        sceneNum++;
        sceneInAct++;
        scenes.push({
          id: b.id,
          actNum,
          subNum: sceneInAct,
          num: sceneNum,
          text: b.text || b.type,
          cast: "",
          index: i,
          kind: "scene",
        });
      }
    }
  });
  return scenes;
}

export function docStats(blocks: ScriptBlock[]) {
  const all = blocks.map((b) => b.text).join(" ");
  const words = all.trim() ? all.trim().split(/\s+/).length : 0;
  const chars = all.replace(/\s/g, "").length;
  const pages = Math.max(1, Math.ceil(chars / 1500));
  const mm = String(Math.floor(pages)).padStart(2, "0");
  return { words, chars, pages, timing: `${mm}:00` };
}

export function noteDocStats(html: string) {
  let plain = "";
  try {
    if (typeof document !== "undefined") {
      const tmp = document.createElement("div");
      tmp.innerHTML = html || "";
      plain = tmp.textContent || tmp.innerText || "";
    } else {
      plain = String(html || "").replace(/<[^>]+>/g, " ");
    }
  } catch {
    plain = String(html || "").replace(/<[^>]+>/g, " ");
  }
  const all = plain.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  const words = all ? all.split(/\s+/).length : 0;
  const chars = all.replace(/\s/g, "").length;
  const pages = Math.max(1, Math.ceil(chars / 1500));
  const mm = String(Math.floor(pages)).padStart(2, "0");
  return { words, chars, pages, timing: `${mm}:00` };
}
