// @ts-nocheck
/**
 * Editor domain model.
 *
 * Extracted verbatim from reference.html MODULE: block-defs + MODULE:
 * modes-data + MODULE: helpers. `AIM`/`AIR` now live in domain/ai.ts; this
 * file re-exports them so existing importers keep working until every
 * consumer imports from ai.ts directly.
 *
 * The MODES array contains inline SVG JSX, so this file is TSX-flavored
 * even though its extension is `.ts`. The legacy codebase runs under
 * `@ts-nocheck` so mixing JSX in a .ts file does not trip the compiler
 * (Vite/esbuild JSX transform picks it up because the surrounding bundle
 * already imports React). If we tighten types later, rename to `.tsx`.
 */
import React from "react";
import { T2 } from "../ui/tokens";

export { AIM, AIR } from "./ai";

export const BLOCK_DEFS = {
  film: [
    { type:"scene",    label:"Место и время",     hotkey:"0", spell:false, ph:"ИНТ. ЛОКАЦИЯ. ДЕНЬ.",
      next:"cast",
      st:{ textTransform:"uppercase", fontWeight:"bold", color:"#f0ece0",
           paddingTop:"32px", paddingBottom:"0", lineHeight:"1.5" } },
    { type:"cast",     label:"Участники сцены",   hotkey:"1", spell:false, ph:"ГЕРОЙ (возраст), ВТОРОЙ",
      next:"action",
      st:{ textTransform:"uppercase", color:"#aaa", paddingTop:"0", paddingBottom:"0", lineHeight:"1.5" } },
    { type:"action",   label:"Описание действия", hotkey:"2", spell:true,  ph:"Описание действия...",
      next:"action",
      st:{ color:"#e0dcd0", paddingTop:"18px", paddingBottom:"0" } },
    { type:"char",     label:"Герой",             hotkey:"3", spell:false, ph:"ИМЯ ПЕРСОНАЖА",
      next:"dialogue",
      st:{ textTransform:"uppercase", color:"#f0ece0",
           paddingLeft:"211px", paddingTop:"18px", paddingBottom:"0", lineHeight:"1.5" } },
    { type:"dialogue", label:"Диалог",            hotkey:"4", spell:true,  ph:"Слова персонажа...",
      next:"char",
      st:{ paddingLeft:"96px", paddingRight:"144px", paddingTop:"0", paddingBottom:"0" } },
    { type:"paren",    label:"Ремарка",           hotkey:"5", spell:true,  ph:"(действие)",
      next:"dialogue",
      st:{ paddingLeft:"154px", paddingRight:"144px", fontStyle:"italic",
           color:"#666", paddingTop:"0", paddingBottom:"0", lineHeight:"1.5" } },
    { type:"spacer",   label:"Отступ",           hotkey:"6", spell:false, ph:"",
      next:"spacer",
      st:{ paddingTop:"0", paddingBottom:"0" } },
    { type:"note",     label:"Комментарий",       hotkey:"6", spell:true,  ph:"Заметка автора...",
      next:"action",
      st:{ color:"#4a4a6a", fontStyle:"italic",
           borderLeft:"2px solid #2a2a4a", paddingLeft:"14px",
           paddingTop:"14px", paddingBottom:"4px" } },
    { type:"trans",    label:"Монтаж",           hotkey:"7", spell:false, ph:"CUT TO:",
      next:"scene",
      st:{ textTransform:"uppercase", textAlign:"right",
           paddingTop:"18px", paddingBottom:"4px", color:"#555" } },
  ],
  play: [
    { type:"act",      label:"Акт",              hotkey:"0", spell:false, ph:"АКТ ПЕРВЫЙ",
      next:"scene",
      st:{ textTransform:"uppercase", fontWeight:"bold", color:"#f0ece0",
           textAlign:"center", paddingTop:"48px", paddingBottom:"8px",
           lineHeight:"1.6", fontSize:"15px", letterSpacing:"3px" } },
    { type:"scene",    label:"Сцена",             hotkey:"1", spell:false, ph:"",
      next:"cast",
      st:{ fontWeight:"bold", color:"#c8c4e0", paddingTop:"24px", paddingBottom:"0",
           lineHeight:"1.6", fontSize:"14px" } },
    { type:"cast",     label:"Действующие лица", hotkey:"2", spell:false, ph:"Действующие лица сцены...",
      next:"stage",
      st:{ color:"#8886aa", paddingTop:"0", paddingBottom:"0", lineHeight:"1.6", fontStyle:"italic" } },
    { type:"stage",    label:"Ремарка",          hotkey:"3", spell:true,  ph:"Описание места, обстановки...",
      next:"line",
      st:{ fontStyle:"italic", color:"#7a789a", paddingTop:"16px", paddingBottom:"4px", lineHeight:"1.7" } },
    { type:"line",     label:"Реплика",          hotkey:"4", spell:true,  ph:"текст реплики...",
      next:"line",
      st:{ paddingTop:"4px", paddingBottom:"0", lineHeight:"1.7" } },
    { type:"spacer",   label:"Отступ",           hotkey:"6", spell:false, ph:"",
      next:"spacer",
      st:{ paddingTop:"0", paddingBottom:"0" } },
    { type:"note",     label:"Комментарий",      hotkey:"5", spell:true,  ph:"Авторское примечание...",
      next:"stage",
      st:{ color:"#4a4a6a", fontStyle:"italic", paddingTop:"14px" } },
  ],
  short: [
    { type:"scene",    label:"Блок",              hotkey:"0", spell:false, ph:"ЛОКАЦИЯ. ВРЕМЯ.",
      next:"cast",
      st:{ fontWeight:"bold", color:"#f0ece0", paddingTop:"28px", paddingBottom:"0", lineHeight:"1.5", borderLeft:"3px solid #f87171", paddingLeft:"14px" } },
    { type:"cast",     label:"Участники",         hotkey:"1", spell:false, ph:"ПЕРСОНАЖ: ...",
      next:"action",
      st:{ color:"#777", paddingTop:"0", paddingBottom:"0", lineHeight:"1.5", fontSize:"12px", borderLeft:"3px solid #93c5fd", paddingLeft:"14px" } },
    { type:"action",   label:"Описание",          hotkey:"2", spell:true,  ph:"Описание...",
      next:"action",
      st:{ paddingTop:"16px", paddingLeft:"17px" } },
    { type:"video",    label:"Видео",             hotkey:"4", spell:false, ph:"ВИДЕО 1...", bold:true,
      next:"hook",
      st:{ color:"#a78bfa", fontSize:"13px", fontWeight:"bold", letterSpacing:"1px", paddingTop:"16px", paddingLeft:"17px", textTransform:"uppercase" } },
    { type:"hook",     label:"Хук",               hotkey:"5", spell:true,  ph:"[0:00–0:03] Хук...",
      next:"body",
      st:{ borderLeft:"3px solid #f472b6", paddingLeft:"14px", color:"#f4d0e0", paddingTop:"14px" } },
    { type:"body",     label:"Основа",            hotkey:"6", spell:true,  ph:"[0:03–0:45] Основа...",
      next:"cta",
      st:{ borderLeft:"3px solid #60a5fa", paddingLeft:"14px", paddingTop:"14px" } },
    { type:"cta",      label:"CTA",               hotkey:"7", spell:true,  ph:"[0:45–0:60] CTA...",
      next:"scene",
      st:{ borderLeft:"3px solid #4ade80", paddingLeft:"14px", color:"#c8f4d0", paddingTop:"14px" } },
  ],
  media: [
    { type:"segment",  label:"Блок",              hotkey:"1", spell:false, ph:"НАЗВАНИЕ  |  0:00",
      next:"anchor",
      st:{ textTransform:"uppercase", fontWeight:"bold", color:"#f0ece0",
           paddingTop:"32px", paddingBottom:"4px", lineHeight:"1.5",
           borderBottom:"1px solid #ffffff22", letterSpacing:"2px" } },
    { type:"anchor",   label:"Подводка",          hotkey:"2", spell:true,  ph:"Текст ведущего...",
      next:"anchor",
      st:{ color:"#e0dcd0", paddingTop:"12px", paddingBottom:"0", lineHeight:"1.8", paddingLeft:"17px" } },
    { type:"sync",     label:"Синхрон",           hotkey:"3", spell:true,  ph:"Реплика гостя...",
      next:"anchor",
      st:{ borderLeft:"3px solid #60a5fa", paddingLeft:"14px",
           color:"#c8d8f4", fontStyle:"italic", paddingTop:"12px" } },
    { type:"vtr",      label:"ВТР",               hotkey:"4", spell:false, ph:"[ВТР] Описание видеопакета...",
      next:"anchor",
      st:{ borderLeft:"3px solid #f472b6", paddingLeft:"14px",
           color:"#f4c8d8", paddingTop:"12px", fontSize:"12px" } },
    { type:"offscreen",label:"Закадр",            hotkey:"5", spell:true,  ph:"Текст за кадром...",
      next:"anchor",
      st:{ borderLeft:"3px solid #fbbf24", paddingLeft:"14px",
           color:"#f4ecc8", paddingTop:"12px" } },
    { type:"lower3",   label:"Плашка",            hotkey:"6", spell:false, ph:"[ПЛАШКА] Имя / Должность",
      next:"anchor",
      st:{ background:"#ffffff08", borderRadius:"4px", padding:"6px 12px 6px 17px",
           color:"#aaa", fontSize:"12px", marginTop:"8px", letterSpacing:"1px" } },
    { type:"question", label:"Вопрос",             hotkey:"8", spell:true,  ph:"Вопрос ведущего...",
      next:"note",
      st:{ fontWeight:"bold", color:T2, paddingTop:"16px", paddingBottom:"0",
           lineHeight:"1.7", paddingLeft:"17px" } },
    { type:"note",     label:"Комментарий",         hotkey:"9", spell:true,  ph:"Контекст, подсказка, уточнение...",
      next:"question",
      st:{ color:"#6a6a8a", fontStyle:"italic", fontSize:"12px",
           paddingTop:"4px", paddingBottom:"0", paddingLeft:"15px",
           borderLeft:"2px solid #3a3a5a", lineHeight:"1.6" } },
    { type:"spacer",   label:"Отступ",            hotkey:"0", spell:false, ph:"",
      next:"spacer",
      st:{ paddingTop:"0", paddingBottom:"0" } },
  ],
  note: [],
};

export const MODES = [
  { id:"film",  label:"Сценарий", icon:(
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="3"/>
      <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="2" y1="7" x2="7" y2="7"/><line x1="17" y1="7" x2="22" y2="7"/>
      <line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/>
    </svg>
  )},
  { id:"play",  label:"Пьеса", icon:(
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6h20M2 12h12M2 18h8"/>
      <circle cx="19" cy="17" r="3"/>
      <path d="M19 14v-2"/>
    </svg>
  )},
  { id:"short", label:"Видео", icon:(
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="3"/>
      <line x1="9" y1="7" x2="15" y2="7"/>
      <line x1="9" y1="11" x2="15" y2="11"/>
      <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
    </svg>
  )},
  { id:"media", label:"Медиа", icon:(
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 3h-8M12 3v4"/>
      <circle cx="12" cy="14" r="2"/>
      <path d="M8 14h.01M16 14h.01"/>
    </svg>
  )},
  { id:"note", label:"Блокнот", icon:(
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.375 2.625a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/>
    </svg>
  )},
];

export const NOTEBOOK_INIT = [
  { id:1001, type:"note_text", text:"" },
];

let _uid = 500;
export const uid = () => ++_uid;

export function makeScene(sceneText, castText, extraBlocks = []) {
  return [
    { id:uid(), type:"scene", text:sceneText },
    { id:uid(), type:"cast",  text:castText  },
    ...extraBlocks,
  ];
}

export const INIT = {
  film: [
    ...makeScene("ИНТ. КОФЕЙНЯ. ДЕНЬ.", "МАРИНА (28)", [
      { id:uid(), type:"action",   text:"Небольшое уютное место. За угловым столиком — МАРИНА (28), сценарист. Ноутбук и остывший кофе." },
      { id:uid(), type:"char",     text:"МАРИНА" },
      { id:uid(), type:"dialogue", text:"Почему каждая история начинается с кофейни?" },
      { id:uid(), type:"action",   text:"Она смотрит в окно. На улице идёт дождь." },
    ]),

  ],
  play: [
    { id:uid(), type:"act",   text:"АКТ ПЕРВЫЙ" },
    { id:uid(), type:"scene", text:"" },
    { id:uid(), type:"cast",  text:"ВЕРНЕР, БАРБАРА" },
    { id:uid(), type:"stage", text:"Кухня в квартире. Вернер стоит у окна, Барбара сидит за столом. Долгое молчание." },
    { id:uid(), type:"line",  name:"ВЕРНЕР",  text:"Этой весной." },
    { id:uid(), type:"line",  name:"БАРБАРА", text:"Этой весной?!" },
    { id:uid(), type:"line",  name:"ВЕРНЕР",  text:"Да, этой весной." },
    { id:uid(), type:"stage", text:"Молчание." },
    { id:uid(), type:"line",  name:"БАРБАРА", text:"Я не понимаю, ты всё ещё надеешься на положительный результат?" },
    { id:uid(), type:"line",  name:"ВЕРНЕР",  text:"Уже пять часов утра." },

  ],
  short: [
    { id:uid(), type:"video", text:"ВИДЕО 1" },
    { id:uid(), type:"hook",  text:"Ты тратишь 3 часа на сценарий который можно написать за 20 минут." },
    { id:uid(), type:"body",  text:"Показываем редактор. Три шага.\nИдея → Структура → Готово." },
    { id:uid(), type:"cta",   text:"Ссылка в описании. Первый сценарий бесплатно." },
  ],
  media: [
    { id:uid(), type:"segment",   text:"ОТКРЫТИЕ  |  0:00 – 1:30" },
    { id:uid(), type:"anchor",    text:"Добрый вечер. В эфире — программа «Точка зрения». Сегодня мы говорим о том, как меняется язык кино." },
    { id:uid(), type:"sync",      text:"Кино всегда говорило на языке своего времени. Сейчас этот язык меняется быстрее, чем мы успеваем осмыслить." },
    { id:uid(), type:"vtr",       text:"[ВТР] Архивные съёмки. Старые кинозалы. Новые стриминги. 45 сек." },
    { id:uid(), type:"segment",   text:"ИНТЕРВЬЮ  |  1:30 – 8:00" },
    { id:uid(), type:"anchor",    text:"У нас в гостях режиссёр, сценарист и продюсер. Расскажите — с чего всё начинается?" },
    { id:uid(), type:"sync",      text:"Всегда с вопроса. Не с ответа — с вопроса, на который у тебя пока нет слов." },
    { id:uid(), type:"lower3",    text:"[ПЛАШКА] Имя Фамилия / Режиссёр" },
  ],
  note: [],
};
