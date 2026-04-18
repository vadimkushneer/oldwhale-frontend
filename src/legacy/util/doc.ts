// @ts-nocheck
/**
 * Document helpers extracted verbatim from reference.html MODULE: doc-utils.
 *
 * Covers: Russian play-act ordinal dictionaries + title helpers, scene/act
 * enumeration per mode, word/character/page-count stats for structured
 * (blocks) vs free-form (note HTML) content, and the textarea auto-grow
 * helper (kept here for backwards compatibility; originated in MODULE:
 * helpers).
 */

export function autoH(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

export const PLAY_ACT_ORDINAL_1_TO_19 = {
  1: "ПЕРВЫЙ",
  2: "ВТОРОЙ",
  3: "ТРЕТИЙ",
  4: "ЧЕТВЁРТЫЙ",
  5: "ПЯТЫЙ",
  6: "ШЕСТОЙ",
  7: "СЕДЬМОЙ",
  8: "ВОСЬМОЙ",
  9: "ДЕВЯТЫЙ",
  10: "ДЕСЯТЫЙ",
  11: "ОДИННАДЦАТЫЙ",
  12: "ДВЕНАДЦАТЫЙ",
  13: "ТРИНАДЦАТЫЙ",
  14: "ЧЕТЫРНАДЦАТЫЙ",
  15: "ПЯТНАДЦАТЫЙ",
  16: "ШЕСТНАДЦАТЫЙ",
  17: "СЕМНАДЦАТЫЙ",
  18: "ВОСЕМНАДЦАТЫЙ",
  19: "ДЕВЯТНАДЦАТЫЙ"
};
export const PLAY_ACT_TENS_CARDINAL = {
  20: "ДВАДЦАТЬ",
  30: "ТРИДЦАТЬ",
  40: "СОРОК",
  50: "ПЯТЬДЕСЯТ",
  60: "ШЕСТЬДЕСЯТ",
  70: "СЕМЬДЕСЯТ",
  80: "ВОСЕМЬДЕСЯТ",
  90: "ДЕВЯНОСТО"
};
export const PLAY_ACT_TENS_ORDINAL = {
  20: "ДВАДЦАТЫЙ",
  30: "ТРИДЦАТЫЙ",
  40: "СОРОКОВОЙ",
  50: "ПЯТИДЕСЯТЫЙ",
  60: "ШЕСТИДЕСЯТЫЙ",
  70: "СЕМИДЕСЯТЫЙ",
  80: "ВОСЬМИДЕСЯТЫЙ",
  90: "ДЕВЯНОСТЫЙ"
};
export function getPlayActOrdinalWord(n) {
  const num = Number(n);
  if (!Number.isFinite(num) || num <= 0) return "";
  if (PLAY_ACT_ORDINAL_1_TO_19[num]) return PLAY_ACT_ORDINAL_1_TO_19[num];
  if (PLAY_ACT_TENS_ORDINAL[num]) return PLAY_ACT_TENS_ORDINAL[num];
  const tens = Math.floor(num / 10) * 10;
  const ones = num % 10;
  if (PLAY_ACT_TENS_CARDINAL[tens] && PLAY_ACT_ORDINAL_1_TO_19[ones]) {
    return PLAY_ACT_TENS_CARDINAL[tens] + " " + PLAY_ACT_ORDINAL_1_TO_19[ones];
  }
  return String(num);
}
export function getPlayActTitle(n) {
  const word = getPlayActOrdinalWord(n);
  return word ? ("АКТ " + word) : "АКТ";
}
export function isPlayAutoActTitle(text) {
  const value = String(text || "").trim();
  return !value || /^АКТ\s+\d+$/i.test(value);
}
export function getPlayActDisplayText(text, actNum) {
  const value = String(text || "").trim();
  return isPlayAutoActTitle(value) ? getPlayActTitle(actNum) : value;
}

export function getScenes(blocks, mode) {
  const scenes = [];
  let actNum = 0;
  let sceneNum = 0;
  let sceneInAct = 0;
  blocks.forEach((b, i) => {
    if (mode === "play") {
      if (b.type === "act") {
        actNum++;
        sceneInAct = 0;
        scenes.push({ id: b.id, actNum, num: actNum, text: getPlayActDisplayText(b.text, actNum), cast: "", index: i, kind: "act" });
      } else if (b.type === "scene") {
        sceneNum++;
        sceneInAct++;
        const cast = blocks[i+1]?.type === "cast" ? blocks[i+1].text : "";
        const label = b.text || ("Сцена " + sceneInAct);
        scenes.push({ id: b.id, actNum, subNum: sceneInAct, num: sceneNum, text: label, cast, index: i, kind: "scene" });
      }
    } else if (mode === "media") {
      if (b.type === "segment") {
        actNum++;
        sceneInAct = 0;
        scenes.push({ id: b.id, actNum, num: actNum, text: b.text, cast: "", index: i, kind: "act" });
      } else if (["anchor","sync","vtr","offscreen","lower3","question","note"].includes(b.type)) {
        sceneNum++;
        sceneInAct++;
        scenes.push({ id: b.id, actNum, subNum: sceneInAct, num: sceneNum, text: b.text||b.type, cast: "", index: i, kind: "scene" });
      }
    } else if (mode === "film") {
      if (b.type === "act") {
        actNum++;
        sceneInAct = 0;
        scenes.push({ id: b.id, actNum, num: null, text: b.text || ("АКТ " + actNum), cast: "", index: i, kind: "act" });
      } else if (b.type === "scene") {
        sceneNum++;
        sceneInAct++;
        const cast = blocks[i+1]?.type === "cast" ? blocks[i+1].text : "";
        scenes.push({ id: b.id, actNum, subNum: sceneInAct, num: sceneNum, text: b.text, cast, index: i, kind: "scene" });
      }
    } else {
      if (b.type === "scene") {
        sceneNum++;
        const cast = blocks[i+1]?.type === "cast" ? blocks[i+1].text : "";
        scenes.push({ id: b.id, num: sceneNum, text: b.text, cast, index: i, kind: "scene" });
      } else if (b.type === "video") {
        actNum++;
        sceneInAct = 0;
        scenes.push({ id: b.id, actNum, num: actNum, text: b.text||("ВИДЕО "+actNum), cast: "", index: i, kind: "act" });
      } else if (["hook","body","cta"].includes(b.type)) {
        sceneNum++;
        sceneInAct++;
        scenes.push({ id: b.id, actNum, subNum: sceneInAct, num: sceneNum, text: b.text||b.type, cast: "", index: i, kind: "scene" });
      }
    }
  });
  return scenes;
}

export function docStats(blocks) {
  const all = blocks.map(b => b.text).join(" ");
  const words = all.trim() ? all.trim().split(/\s+/).length : 0;
  const chars = all.replace(/\s/g,"").length;
  const pages = Math.max(1, Math.ceil(chars / 1500));
  const mm = String(Math.floor(pages)).padStart(2,"0");
  return { words, chars, pages, timing: `${mm}:00` };
}

export function noteDocStats(html) {
  let plain = "";
  try {
    if (typeof document !== "undefined") {
      const tmp = document.createElement("div");
      tmp.innerHTML = html || "";
      plain = tmp.textContent || tmp.innerText || "";
    } else {
      plain = String(html || "").replace(/<[^>]+>/g, " ");
    }
  } catch (e) {
    plain = String(html || "").replace(/<[^>]+>/g, " ");
  }
  const all = plain.replace(/ /g, " ").replace(/\s+/g, " ").trim();
  const words = all ? all.split(/\s+/).length : 0;
  const chars = all.replace(/\s/g, "").length;
  const pages = Math.max(1, Math.ceil(chars / 1500));
  const mm = String(Math.floor(pages)).padStart(2, "0");
  return { words, chars, pages, timing: `${mm}:00` };
}
