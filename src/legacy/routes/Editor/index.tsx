// @ts-nocheck
/**
 * EditorScreen - extracted verbatim from legacyUiBundle.tsx:569-6986.
 *
 * All module-scope dependencies that used to live alongside EditorScreen in
 * the generated bundle now come from:
 *   - src/legacy/ui/tokens      BG, SURF, SH_OUT, SH_IN, SH_SM, ACCENT, T1, T2, T3
 *   - src/legacy/ui/Whale       Whale logo component
 *   - src/legacy/domain/blocks  BLOCK_DEFS, AIM, AIR, MODES, NOTEBOOK_INIT, INIT, uid, makeScene
 *   - src/legacy/hooks/useWindowWidth
 *   - src/legacy/util/doc       autoH, getScenes, docStats, noteDocStats
 *   - ./PlayHeader              PlayHeaderEditor (was a neighbor function in the bundle)
 *
 * The body below is intentionally untouched from the bundle version so the
 * visual diff against the reference baselines stays within tolerance. Any
 * further sub-splitting (Toolbar / SceneList / Canvas / modes / exports)
 * happens in follow-up passes, each gated on the editor-note/film/play/media
 * snapshots remaining green.
 */
import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { BG, SURF, SH_OUT, SH_IN, SH_SM, ACCENT, T1, T2, T3 } from "../../ui/tokens";
import { Whale } from "../../ui/Whale";
import {
  BLOCK_DEFS,
  AIM,
  AIR,
  MODES,
  NOTEBOOK_INIT,
  INIT,
  uid,
  makeScene,
} from "../../domain/blocks";
import { useWindowWidth } from "../../hooks/useWindowWidth";
import { autoH, getScenes, docStats, noteDocStats } from "../../util/doc";
import { PlayHeaderEditor } from "./PlayHeader";

function EditorScreen({ onLogout, profile, isGuest, onLogin }) {
  const [mode, setMode] = useState(profile?.mode || "film");
  const modeBlocksCache = useRef({});
  const [blocks, setBlocks]           = useState(() => { const m=profile?.mode||"film"; return (INIT[m]||INIT.film).map(b=>({...b})); });
  const blocksRef = useRef([]);
  useEffect(()=>{ blocksRef.current = blocks; }, [blocks]);
  const modeRef = useRef(mode);
  useEffect(()=>{ modeRef.current = mode; }, [mode]);
  const whaleFileHandleRef = useRef(null);
  const saveNowRef = useRef(()=>{});
  const [focId, setFocId]             = useState(null);
  const [activeSceneId, setActiveSceneId] = useState(null);
  const [aiMod, setAiMod]             = useState("deepseek");
  const [credits, setCredits]         = useState(340);
  const [aiIn, setAiIn]               = useState("");
  const [msgs, setMsgs]               = useState([{role:"sys",text:"Привет. Готов помочь с твоим сценарием. Что хочешь улучшить?"}]);
  const [aiLoad, setAiLoad]           = useState(false);
  const [aiOpen, setAiOpen]           = useState(true);
  const [saved, setSaved]             = useState(true);
  const [mobileTab, setMobileTab]     = useState("editor");
  const [projectName, setProjectName] = useState("Без названия");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft]     = useState("Без названия");
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [projectId,   setProjectId]   = useState(()=>"proj_"+Date.now());
  const [projectsOpen,setProjectsOpen]= useState(false);
  const [saveAsOpen,  setSaveAsOpen]  = useState(false);
  const [exportUrl,   setExportUrl]   = useState(null);
  const [titlePageOpen, setTitlePageOpen] = useState(false);
  const [newProjectOverlay, setNewProjectOverlay] = useState(false);
  const [docFont, setDocFont] = useState("Times New Roman");
  const [sceneAlign, setSceneAlign] = useState("left");
  const [docFontOpen, setDocFontOpen] = useState(false);
  const [playHeader, setPlayHeader] = useState([
    { key:"author", label:"Имя",      text:"", align:"left", font:"Times New Roman", size:14 },
    { key:"title",  label:"Название", text:"", align:"left", font:"Times New Roman", size:18 },
    { key:"genre",  label:"Жанр",     text:"", align:"left", font:"Times New Roman", size:13 },
    { key:"remark", label:"Ремарка",  text:"", align:"left", font:"Times New Roman", size:13 },
  ]);
  const [playHeaderFoc, setPlayHeaderFoc] = useState(null);
  const [mediaHeader, setMediaHeader] = useState([
    { key:"show",    label:"Программа",  text:"", align:"left", font:"Arial", size:18, bold:true },
    { key:"episode", label:"Выпуск",     text:"", align:"left", font:"Arial", size:13 },
    { key:"date",    label:"Дата эфира", text:"", align:"left", font:"Arial", size:13 },
    { key:"channel", label:"Канал",      text:"", align:"left", font:"Arial", size:13 },
    { key:"host",    label:"Ведущий",    text:"", align:"left", font:"Arial", size:13 },
  ]);
  const [mediaHeaderFoc, setMediaHeaderFoc] = useState(null);
  const [contentHeader, setContentHeader] = useState([
    { key:"title",    label:"Тема",       text:"", align:"left", font:"Arial", size:18, bold:true },
    { key:"platform", label:"Платформа",  text:"", align:"left", font:"Arial", size:13 },
    { key:"format",   label:"Формат",     text:"", align:"left", font:"Arial", size:13 },
    { key:"account",  label:"Аккаунт",    text:"", align:"left", font:"Arial", size:13 },
    { key:"reach",    label:"Охват",      text:"", align:"left", font:"Arial", size:13 },
    { key:"pubdate",  label:"Дата выхода",text:"", align:"left", font:"Arial", size:13 },
  ]);
  const [contentHeaderFoc, setContentHeaderFoc] = useState(null);
  const [contentLogo, setContentLogo] = useState(null);
  const [titleSepPage, setTitleSepPage] = useState(true);
  const [previewOpen,  setPreviewOpen]  = useState(false);
  const [previewW,     setPreviewW]     = useState(null); // null = треть экрана
  const [spellOn,      setSpellOn]      = useState(false);
  const [zoom,         setZoom]         = useState(100);
  const [keyboardH,    setKeyboardH]    = useState(0);
  const [viewportH,    setViewportH]    = useState(window.innerHeight);
  const [leftW,        setLeftW]        = useState(215);
  const [rightW,       setRightW]       = useState(158);
  const [aiW,          setAiW]          = useState(255);
  const [aiComposerH,  setAiComposerH]  = useState(56);
  const [previewHtml,  setPreviewHtml]  = useState("");
  const [noteText, setNoteText] = useState(()=>{
    try { const d=localStorage.getItem("ow_note_draft"); if(d){localStorage.removeItem("ow_note_draft"); return d;} } catch(e){}
    return "";
  });
  const [noteFontSize, setNoteFontSize] = useState(14);
  const [noteAlignOpen, setNoteAlignOpen] = useState(false);
  const [noteAlign, setNoteAlign] = useState("left");
  const [noteColorOpen, setNoteColorOpen] = useState(false);
  const [titlePage, setTitlePage] = useState({
    title: "", genre: "", author: "", phone: "", email: "", year: new Date().getFullYear()+"",
  });

  // Синхронизируем название проекта только с film-титульным листом.
  // Для play титульный лист отдельный и не должен подтягивать название из film.
  useEffect(()=>{
    setTitlePage(tp => (!tp.title || tp.title === tp._syncedName)
      ? { ...tp, title: projectName, _syncedName: projectName }
      : tp
    );
  }, [projectName]);
  const [exportName,  setExportName]  = useState("");
  const [saveAsName,  setSaveAsName]  = useState("");
  const [projectsList,setProjectsList]= useState([]);
  const [dragSceneId, setDragSceneId] = useState(null);
  const [dragOverId,  setDragOverId2]  = useState(null);
  const _dragSceneId = useRef(null);
  const _dragOverId  = useRef(null);
  const _dragJustEnded = useRef(false);
  const _setDragSceneId = useRef((v) => { _dragSceneId.current=v; setDragSceneId(v); });
  const _setDragOverId  = useRef((v) => { _dragOverId.current=v;  setDragOverId2(v); });
  const [selectedScenes, setSelectedScenes] = useState(new Set());

  const toggleSceneSelect = (id) => setSelectedScenes(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const toggleActSelect = (actNum) => {
    const actSceneIds = scenes.filter(s=>s.kind==="scene"&&s.actNum===actNum).map(s=>s.id);
    const allSelected = actSceneIds.every(id=>selectedScenes.has(id));
    setSelectedScenes(prev=>{
      const next = new Set(prev);
      actSceneIds.forEach(id=>allSelected?next.delete(id):next.add(id));
      return next;
    });
  };

  const [copyToast, setCopyToast] = useState(false);

  const copySelectedScenes = () => {
    const selectedIds = selectedScenes;
    const cur = blocksRef.current;
    let sceneNum = 0; let actNum = 0; let sceneInAct = 0;
    const sceneNumMap = {};
    for (const b of cur) {
      if (b.type==="act"||b.type==="segment"||b.type==="video") { actNum++; sceneInAct=0; }
      if (["scene","anchor","sync","vtr","offscreen","lower3","question","hook","body","cta","action"].includes(b.type)) { sceneNum++; sceneInAct++; sceneNumMap[b.id]={num:sceneNum, actNum, subNum:sceneInAct}; }
      // action — контент сцены в film/play, не заголовок
    }
    let text = "";
    let currentSelected = false;
    let curActNum = 0;
    for (const b of cur) {
      if (b.type==="act"||b.type==="segment"||b.type==="video") {
        curActNum++;
        const hasSelected = [...selectedIds].some(id=>sceneNumMap[id]&&sceneNumMap[id].actNum===curActNum);
        if (hasSelected) text += "\n\n" + (b.text||(b.type==="segment"?"БЛОК":b.type==="video"?"ВИДЕО":"АКТ")).toUpperCase();
        continue;
      }
      // scene — всегда заголовок; action — заголовок только в short/media
      const isHeader = b.type==="scene" || 
        (["anchor","sync","vtr","offscreen","lower3","question","hook","body","cta"].includes(b.type)) ||
        (b.type==="action" && mode!=="film" && mode!=="play");
      if (isHeader) {
        currentSelected = selectedIds.has(b.id);
        if (currentSelected) {
          const MEDIA_LABELS = {anchor:"Подводка",sync:"Синхрон",vtr:"ВТР",offscreen:"Закадр",lower3:"Плашка",question:"Вопрос"};
          const n = sceneNumMap[b.id];
          const num = n ? (n.actNum ? `${n.actNum}.${n.subNum}` : String(n.num)) : "";
          const typeLabel = MEDIA_LABELS[b.type] || "";
          const title = b.text || "";
          if (typeLabel) text += "\n\n[" + typeLabel + "]" + (title ? " " + title : "");
          else text += "\n\n" + num + (title ? " " + title : "");
        }
        continue;
      }
      if (currentSelected) {
        // film режим
        if (b.type==="cast")     text += "\n" + b.text;
        if (b.type==="action")   text += "\n\n" + b.text;
        if (b.type==="char")     text += "\n\n" + " ".repeat(20) + b.text;
        if (b.type==="paren")    text += "\n" + " ".repeat(15) + b.text;
        if (b.type==="dialogue") text += "\n" + " ".repeat(10) + b.text;
        if (b.type==="trans")    text += "\n\n" + " ".repeat(30) + b.text;
        // пьеса
        if (b.type==="stage")   text += "\n" + b.text;
        if (b.type==="line")    text += "\n" + (b.name?b.name.toUpperCase()+". ":"") + b.text;
        if (b.type==="note")    text += "\n[" + b.text + "]";
        // медиа
        if (b.type==="sync")    text += "\n[СНХ] " + b.text;
        if (b.type==="vtr")     text += "\n[ВТР] " + b.text;
        if (b.type==="offscreen") text += "\n[ЗКД] " + b.text;
        if (b.type==="lower3")  text += "\n[ПЛАШКА] " + b.text;
        if (b.type==="anchor")  text += "\n" + b.text;
      }
    }
    const result = text.trim();
    if (!result) return;
    navigator.clipboard.writeText(result)
      .then(()=>{ setCopyToast(true); setTimeout(()=>setCopyToast(false), 2000); })
      .catch(()=>{ setCopyToast(true); setTimeout(()=>setCopyToast(false), 2000); });
    // НЕ сбрасываем выделение — пользователь сам снимет через ✕
  };
  const [dragPos,     setDragPos]     = useState({x:0,y:0});
  const [dragCardH,   setDragCardH]   = useState(80);
  const dragLongPress = useRef(null);
  const dragStartY    = useRef(0);
  const sceneCardRefs = useRef({});
  const sceneListRef  = useRef(null);
  const [toolbarBlockId, setToolbarBlockId] = useState(null); // отдельный state для тулбара
  const [typeMenu, setTypeMenu] = useState(null);

  const history     = useRef([]);
  const histIdx     = useRef(-1);
  const histTimer   = useRef(null);
  const blockRefs  = useRef({});
  const sceneRefs  = useRef({});
  const scrollRef  = useRef(null);
  const saveTimer  = useRef(null);
  const msgEnd     = useRef(null);
  const lastFocId  = useRef(null);
  const filmEditStateRef = useRef(null);
  const noteEditorRef   = useRef(null);
  const noteTextRef     = useRef(noteText);
  const noteSelRangeRef = useRef(null);
  const noteHistoryRef = useRef([]);
  const noteHistoryIndexRef = useRef(-1);
  const noteHistoryTimerRef = useRef(null);
  const NOTE_HISTORY_LIMIT = 30;
  const NOTE_HISTORY_DELAY = 600;

  const normalizeNoteHtml = (html) => html == null ? "" : String(html);
  const clearNoteHistoryTimer = () => {
    if (!noteHistoryTimerRef.current) return;
    clearTimeout(noteHistoryTimerRef.current);
    noteHistoryTimerRef.current = null;
  };
  const placeCaretAtEnd = (el) => {
    if (!el) return;
    const sel = window.getSelection && window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  };
  const applyNoteHistoryState = (html) => {
    const nextHtml = normalizeNoteHtml(html);
    if (noteEditorRef.current) noteEditorRef.current.innerHTML = nextHtml;
    noteTextRef.current = nextHtml;
    setNoteText(nextHtml);
    if (noteEditorRef.current) {
      noteEditorRef.current.focus();
      placeCaretAtEnd(noteEditorRef.current);
    }
    markDirty();
  };
  const resetNoteHistory = (html = "") => {
    clearNoteHistoryTimer();
    const nextHtml = normalizeNoteHtml(html);
    noteHistoryRef.current = [nextHtml];
    noteHistoryIndexRef.current = 0;
  };
  const commitNoteHistorySnapshot = (html) => {
    const nextHtml = normalizeNoteHtml(html ?? (noteEditorRef.current ? noteEditorRef.current.innerHTML : noteTextRef.current));
    const history = noteHistoryRef.current;
    const idx = noteHistoryIndexRef.current;
    if (!history.length || idx < 0) {
      noteHistoryRef.current = [nextHtml];
      noteHistoryIndexRef.current = 0;
      return;
    }
    if (history[idx] === nextHtml) return;
    const nextHistory = history.slice(0, idx + 1);
    nextHistory.push(nextHtml);
    if (nextHistory.length > NOTE_HISTORY_LIMIT) nextHistory.splice(0, nextHistory.length - NOTE_HISTORY_LIMIT);
    noteHistoryRef.current = nextHistory;
    noteHistoryIndexRef.current = nextHistory.length - 1;
  };
  const scheduleNoteHistorySnapshot = (html) => {
    clearNoteHistoryTimer();
    const nextHtml = normalizeNoteHtml(html ?? (noteEditorRef.current ? noteEditorRef.current.innerHTML : noteTextRef.current));
    noteHistoryTimerRef.current = setTimeout(() => {
      noteHistoryTimerRef.current = null;
      commitNoteHistorySnapshot(nextHtml);
    }, NOTE_HISTORY_DELAY);
  };
  const undoNoteHistory = () => {
    clearNoteHistoryTimer();
    const currentHtml = normalizeNoteHtml(noteEditorRef.current ? noteEditorRef.current.innerHTML : noteTextRef.current);
    const history = noteHistoryRef.current;
    const idx = noteHistoryIndexRef.current;
    if (!history.length || idx < 0) {
      resetNoteHistory(currentHtml);
      return false;
    }
    if (currentHtml !== history[idx]) {
      applyNoteHistoryState(history[idx]);
      return true;
    }
    if (idx === 0) return false;
    noteHistoryIndexRef.current = idx - 1;
    applyNoteHistoryState(history[idx - 1]);
    return true;
  };
  const redoNoteHistory = () => {
    clearNoteHistoryTimer();
    const currentHtml = normalizeNoteHtml(noteEditorRef.current ? noteEditorRef.current.innerHTML : noteTextRef.current);
    const history = noteHistoryRef.current;
    const idx = noteHistoryIndexRef.current;
    if (!history.length || idx < 0) {
      resetNoteHistory(currentHtml);
      return false;
    }
    if (currentHtml !== history[idx]) return false;
    if (idx >= history.length - 1) return false;
    noteHistoryIndexRef.current = idx + 1;
    applyNoteHistoryState(history[idx + 1]);
    return true;
  };

  useEffect(()=>{
    const noteEditorHasFocus = () => {
      const editor = noteEditorRef.current;
      const active = document.activeElement;
      return !!editor && (active === editor || editor.contains(active));
    };
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key==="z" && !e.shiftKey) {
        if (modeRef.current === "note" && noteEditorHasFocus()) {
          e.preventDefault();
          undoNoteHistory();
          return;
        }
        e.preventDefault();
        undo();
      }
      if (mod && (e.key==="y" || (e.key==="z" && e.shiftKey))) {
        if (modeRef.current === "note" && noteEditorHasFocus()) {
          e.preventDefault();
          redoNoteHistory();
          return;
        }
        e.preventDefault();
        redo();
      }
      if (e.key==="Escape") { setProjectsOpen(false); setMenuOpen(false); }
      // Cmd+S — сохранить
      if (mod && e.key==="s") { e.preventDefault(); saveNowRef.current(); }
      // Cmd+D — дублировать текущий блок
      if (mod && e.key==="d") {
        e.preventDefault();
        const id = lastFocId.current;
        if (!id) return;
        const cur = blocksRef.current.find(b=>b.id===id);
        if (!cur) return;
        const copy = {...cur, id:Date.now()+Math.random()};
        setBlocks(bs=>{ const i=bs.findIndex(b=>b.id===id); const a=[...bs]; a.splice(i+1,0,copy); return a; });
        markDirty();
      }
      // Cmd+Backspace — удалить текущий блок
      if (mod && e.key==="Backspace") {
        e.preventDefault();
        const id = lastFocId.current;
        if (id) delBlock(id);
      }
      // Cmd+↑ — предыдущая сцена
      if (mod && e.key==="ArrowUp") {
        e.preventDefault();
        const sc = getScenes(blocksRef.current, modeRef.current);
        const curId = lastFocId.current;
        const curIdx = blocksRef.current.findIndex(b=>b.id===curId);
        const prevScene = [...sc].reverse().find(s=>s.index<curIdx);
        if (prevScene) { const el=sceneRefs.current[prevScene.id]; el?.scrollIntoView({behavior:"smooth",block:"start"}); blockRefs.current[prevScene.id]?.focus(); }
      }
      // Cmd+↓ — следующая сцена
      if (mod && e.key==="ArrowDown") {
        e.preventDefault();
        const sc = getScenes(blocksRef.current, modeRef.current);
        const curId = lastFocId.current;
        const curIdx = blocksRef.current.findIndex(b=>b.id===curId);
        const nextScene = sc.find(s=>s.index>curIdx);
        if (nextScene) { const el=sceneRefs.current[nextScene.id]; el?.scrollIntoView({behavior:"smooth",block:"start"}); blockRefs.current[nextScene.id]?.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return ()=>window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(()=>()=>{ clearNoteHistoryTimer(); },[]);

  const winW     = useWindowWidth();
  const isMobile = winW < 768;

  // ── Derived ──────────────────────────────────
  const defs   = BLOCK_DEFS[mode];
  const scenes = getScenes(blocks, mode);
  const st     = mode === "note" ? noteDocStats(noteText) : docStats(blocks);
  const mc     = AIM.find(x=>x.id===aiMod)?.color || ACCENT;

  // ── Helpers ──────────────────────────────────
  const setFoc = (id) => {
    setFocId(id);
    if (id) {
      lastFocId.current = id;
      setToolbarBlockId(id);
      // Обновляем активную сцену по фокусу
      const idx = blocks.findIndex(b=>b.id===id);
      for (let j=idx; j>=0; j--) {
        if (blocks[j].type==="scene") { setActiveSceneId(blocks[j].id); break; }
      }
    }
  };
  const getActiveBlockId = () => toolbarBlockId || focId || lastFocId.current || null;

  const getFormatConfig = (m) => ({
    film:  { bold:true,  italic:false, underline:false },
    play:  { bold:false, italic:true,  underline:true  },
    short: { bold:true,  italic:false, underline:false },
    media: { bold:true,  italic:true,  underline:true  },
    note:  { bold:false, italic:false, underline:false },
  }[m] || { bold:false, italic:false, underline:false });

  const switchMode = (m) => {
    modeBlocksCache.current[mode] = blocksRef.current;
    const cached = modeBlocksCache.current[m];
    setBlocks(cached ? [...cached] : (INIT[m]||INIT.film).map(b=>({...b})));
    setMode(m);
    setFocId(null);
    setToolbarBlockId(null);
    setActiveSceneId(null);
    lastFocId.current = null;
    setMenuOpen(false);
  };

  const pushHistory = (blks) => {
    const snapshot = JSON.stringify(blks);
    if (history.current[histIdx.current] === snapshot) return;
    history.current = history.current.slice(0, histIdx.current + 1);
    history.current.push(snapshot);
    if (history.current.length > 100) history.current.shift();
    histIdx.current = history.current.length - 1;
  };

  const undo = () => {
    if (histIdx.current <= 0 || history.current.length === 0) return;
    histIdx.current--;
    const blks = JSON.parse(history.current[histIdx.current]);
    setBlocks(blks);
    setSaved(false);
  };

  const redo = () => {
    if (histIdx.current >= history.current.length - 1) return;
    histIdx.current++;
    const blks = JSON.parse(history.current[histIdx.current]);
    setBlocks(blks);
    setSaved(false);
  };

  const saveProject = (id, name, blks, mod) => {
    try {
      const nt = noteTextRef.current;
      const meta = { id, name, mode: mod, updatedAt: Date.now(), blocksCount: blks.filter(b=>b.type==="scene").length };
      const data = { ...meta, blocks: blks, playHeader, mediaHeader, contentHeader, contentLogo, docFont, sceneAlign, noteText: nt };
      localStorage.setItem("ow_proj_"+id, JSON.stringify(data));
      const index = JSON.parse(localStorage.getItem("ow_index")||"[]");
      const next = [meta, ...index.filter(p=>p.id!==id)];
      localStorage.setItem("ow_index", JSON.stringify(next));
    } catch(e) {}
  };

  const markDirty = (newBlocks) => {
    const blks = newBlocks || blocksRef.current;
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(()=>{
      setSaved(true);
      saveProject(projectId, projectName, blocksRef.current, mode);
    }, 1500);
    pushHistory(blks);
  };

  const onScroll = () => {
    const c = scrollRef.current; if (!c) return;
    const top = c.scrollTop; let cur = null;
    for (const s of scenes) {
      const el = sceneRefs.current[s.id];
      if (el && el.offsetTop - 80 <= top) cur = s.id;
    }
    if (cur) setActiveSceneId(cur);
  };

  const goToScene = (id) => {
    const el = sceneRefs.current[id];
    if (el && scrollRef.current)
      scrollRef.current.scrollTo({top: el.offsetTop - 60, behavior:"smooth"});
    setActiveSceneId(id);
  };

  const loadProject = (proj) => {
    setProjectId(proj.id);
    setProjectName(proj.name);
    setMode(proj.mode||"film");
    setBlocks(proj.blocks.map(b=>({...b})));
    setFocId(null);
    setToolbarBlockId(null);
    lastFocId.current = null;
    if (proj.playHeader) setPlayHeader(proj.playHeader);
    if (proj.mediaHeader) setMediaHeader(proj.mediaHeader);
    if (proj.contentHeader) setContentHeader(proj.contentHeader);
    if (proj.contentLogo) setContentLogo(proj.contentLogo);
      if (proj.noteText !== undefined) { setNoteText(proj.noteText); noteTextRef.current = proj.noteText; }
    if (proj.docFont)    setDocFont(proj.docFont);
    if (proj.sceneAlign) setSceneAlign(proj.sceneAlign);
    setSaved(true);
    setProjectsOpen(false);
    setMenuOpen(false);
  };

  const newProject = () => {
    const nid = "proj_"+Date.now();
    const nextMode = mode;
    const year = new Date().getFullYear()+"";

    setProjectId(nid);
    setProjectName("Без названия");
    setBlocks((INIT[nextMode] || []).map(b=>({...b})));
    setFocId(null);
    setToolbarBlockId(null);
    lastFocId.current = null;
    setNewProjectOverlay(true);

    if (nextMode === "film") {
      setTitlePage({ title:"", genre:"", author:"", phone:"", email:"", year });
      setTitlePageOpen("pdf");
    } else if (nextMode === "play") {
      setPlayHeader(prev => prev.map(h => ({ ...h, text:"" })));
      setTitlePageOpen("pdf");
    } else if (nextMode === "short" || nextMode === "media") {
      if (nextMode === "short") {
        setContentHeader(prev => prev.map(h => ({ ...h, text:"" })));
        setContentLogo(null);
      } else {
        setMediaHeader(prev => prev.map(h => ({ ...h, text:"" })));
      }
      setTitlePageOpen("pdf");
    } else if (nextMode === "note") {
      setNoteText("");
      noteTextRef.current = "";
      setTitlePageOpen("txt");
    }

    setSaved(true);
    setMenuOpen(false);
  };

  const finishNewProjectOverlay = () => {
    setNewProjectOverlay(false);
    setTitlePageOpen(false);
    setMenuOpen(false);
  };

  const buildWhaleExport = () => {
    const data = JSON.stringify({ name: projectName, mode, blocks, playHeader, mediaHeader, contentHeader, contentLogo, docFont, sceneAlign, noteText, version: 1 }, null, 2);
    const name = (projectName || "project") + ".whale";
    return { name, blob: new Blob([data], { type: "application/octet-stream" }) };
  };

  const saveNow = async () => {
    clearTimeout(saveTimer.current);
    const { name, blob } = buildWhaleExport();

    if (window.showSaveFilePicker && whaleFileHandleRef.current) {
      try {
        const writable = await whaleFileHandleRef.current.createWritable();
        await writable.write(blob);
        await writable.close();
        saveProject(projectId, projectName, blocksRef.current, modeRef.current);
        setSaved(true);
        setMenuOpen(false);
        return;
      } catch(e) {
        if (e.name === "AbortError") return;
      }
    }

    await saveAs();
  };

  const saveAs = async () => {
    const { name, blob } = buildWhaleExport();

    if (window.showSaveFilePicker) {
      try {
        const ext = name.split(".").pop().toLowerCase();
        const types = [{
          description: name,
          accept: { "application/octet-stream": ["."+ext] },
        }];
        const fh = await window.showSaveFilePicker({ suggestedName: name, types });
        whaleFileHandleRef.current = fh;
        const writable = await fh.createWritable();
        await writable.write(blob);
        await writable.close();
        saveProject(projectId, projectName, blocksRef.current, modeRef.current);
        setSaved(true);
        setMenuOpen(false);
        return;
      } catch(e) {
        if (e.name === "AbortError") return;
      }
    }

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    saveProject(projectId, projectName, blocksRef.current, modeRef.current);
    setSaved(true);
    setMenuOpen(false);
  };

  useEffect(()=>{ saveNowRef.current = saveNow; }, [saveNow]);

  const confirmSaveAs = (name) => {
    const finalName = name.trim() || "Без названия";
    setProjectName(finalName);
    saveProject(projectId, finalName, blocks, mode);
    setSaved(true);
    setSaveAsOpen(false);
  };

  const openProjectsList = () => {
    try {
      const index = JSON.parse(localStorage.getItem("ow_index")||"[]");
      setProjectsList(index);
    } catch(e) { setProjectsList([]); }
    setProjectsOpen(true);
    setMenuOpen(false);
  };

  const deleteProject = (id) => {
    try {
      localStorage.removeItem("ow_proj_"+id);
      const index = JSON.parse(localStorage.getItem("ow_index")||"[]");
      localStorage.setItem("ow_index", JSON.stringify(index.filter(p=>p.id!==id)));
      setProjectsList(pl=>pl.filter(p=>p.id!==id));
    } catch(e) {}
  };

  const shareProject = async () => {
    const data = JSON.stringify({ name: projectName, mode, blocks, playHeader, mediaHeader, contentHeader, contentLogo, docFont, sceneAlign, noteText, version: 1 }, null, 2);
    const name = (projectName||"project") + ".whale";
    const file = new File([data], name, {type: "application/octet-stream"});
    if (navigator.share && navigator.canShare && navigator.canShare({files:[file]})) {
      try {
        await navigator.share({ files: [file], title: name });
        setMenuOpen(false);
        return;
      } catch(e) {}
    }
    // Fallback — показать JSON для копирования
    setExportUrl(data);
    setExportName(name);
    setMenuOpen(false);
  };

  const loadMammothLib = () => new Promise((resolve, reject) => {
    const lib = window.mammoth;
    if (lib) { resolve(lib); return; }
    let attempts = 0;
    const check = setInterval(() => {
      const l = window.mammoth;
      if (l) { clearInterval(check); resolve(l); return; }
      if (++attempts > 80) { clearInterval(check); reject(new Error("mammoth timeout")); }
    }, 100);
  });

  const extractDOCXSemantic = async (arrayBuffer, fileName) => {
    let mammoth;
    try { mammoth = await loadMammothLib(); }
    catch(e) {
      alert("Не удалось загрузить библиотеку Mammoth для DOCX-импорта.");
      return null;
    }

    const result = await mammoth.convertToHtml({ arrayBuffer });
    const tmp = document.createElement("div");
    tmp.innerHTML = result.value || "";

    const getText = (el) => (el.textContent || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
    const isSceneText = (s) => {
      const t = String(s || "").trim();
      if (!t) return false;
      const bare = t.replace(/^\d+\.\s*/, "");
      return /^(?:INT\.?|EXT\.?|INT\.?\s*\/\s*EXT\.?|EXT\.?\s*\/\s*INT\.?|I\/E\.?|EST\.?|ИНТ\.?|НАТ\.?|ИНТ\.?\s*\/\s*НАТ\.?|НАТ\.?\s*\/\s*ИНТ\.?)(?=$|[^A-ZА-ЯЁa-zа-яё])/i.test(bare);
    };
    const isTransitionText = (s) => {
      const t = String(s || "").trim();
      if (!t) return false;
      return /TO:$/.test(t) || /^(FADE|CUT|DISSOLVE|SMASH CUT|MATCH CUT|WIPE|INTERCUT)/.test(t);
    };
    const isUpperCue = (s) => {
      const t = String(s || "").trim();
      if (!t) return false;
      if (t.length > 40) return false;
      return t === t.toUpperCase() && /[A-ZА-ЯЁ]/.test(t);
    };
    const isEmphasisOnly = (el) => {
      const clone = el.cloneNode(true);
      const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.textContent.trim()) continue;
        let parent = node.parentNode;
        let insideEm = false;
        while (parent && parent !== clone) {
          if (parent.nodeType === 1 && ["EM", "I"].includes(parent.tagName)) {
            insideEm = true;
            break;
          }
          parent = parent.parentNode;
        }
        if (!insideEm) return false;
      }
      return true;
    };

    const allParas = Array.from(tmp.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li"));
    const paras = allParas.map(el => ({ el, text: getText(el) })).filter(x => x.text);
    if (paras.length === 0) {
      alert("Не удалось извлечь текст из DOCX-файла");
      return null;
    }

    const importedTitle = paras[0]?.text || fileName.replace(/\.docx$/i, "");
    let titleBoundary = 0;
    for (let i = 0; i < paras.length; i++) {
      if (isSceneText(paras[i].text)) { titleBoundary = i; break; }
    }
    const body = titleBoundary > 0 ? paras.slice(titleBoundary) : paras;

    const semanticBlocks = [];
    let lastType = "";
    body.forEach(({ el, text }) => {
      let blockType = "action";
      let finalText = text;

      if (isSceneText(text)) {
        blockType = "scene";
        finalText = text.replace(/^\d+\.\s*/, "");
      } else if (isTransitionText(text) && isUpperCue(text)) {
        blockType = "trans";
      } else if ((/^\(.*\)$/.test(text) || isEmphasisOnly(el)) && lastType !== "scene") {
        blockType = "paren";
        finalText = text.replace(/^\(/, "").replace(/\)$/, "");
      } else if (isUpperCue(text) && !isSceneText(text) && !isTransitionText(text)) {
        blockType = "char";
      } else if (lastType === "char" || lastType === "paren") {
        blockType = "dialogue";
      } else {
        blockType = "action";
      }

      if (finalText || blockType === "scene") {
        semanticBlocks.push({ type: blockType, text: finalText });
        lastType = blockType;
      }
    });

    if (semanticBlocks.length === 0) {
      alert("Не удалось собрать блоки из DOCX-файла");
      return null;
    }

    return { importedTitle, semanticBlocks };
  };

  const importFilmDOCX = async (arrayBuffer, fileName) => {
    const parsed = await extractDOCXSemantic(arrayBuffer, fileName);
    if (!parsed) return;

    const { importedTitle, semanticBlocks } = parsed;
    const newBlocks = semanticBlocks.map(block => ({ id: uid(), type: block.type, text: block.text }));

    const nid = "proj_" + Date.now();
    setProjectId(nid);
    setProjectName(importedTitle || fileName.replace(/\.docx$/i, ""));
    setMode("film");
    setBlocks(newBlocks);
    setFocId(null); setToolbarBlockId(null); lastFocId.current = null;
    setSaved(true); setMenuOpen(false);
  };

  const openOpenFilePicker = (inputId) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    const currentMode = modeRef.current || mode;
    input.accept = ["film", "play", "short", "media", "note"].includes(currentMode)
      ? ".whale,.fdx,.docx,application/json,application/xml,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : ".whale,.fdx,application/json,application/xml";
    input.click();
  };

  const importWhale = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        if (ext === "docx") {
          const currentMode = modeRef.current || mode;
          if (currentMode === "film") {
            await importFilmDOCX(ev.target.result, file.name);
          } else if (["play", "short", "media"].includes(currentMode)) {
            const parsed = await extractDOCXSemantic(ev.target.result, file.name);
            if (!parsed) return;

            const { importedTitle, semanticBlocks } = parsed;
            const newBlocks = [];

            if (currentMode === "play") {
              let pendingChar = "";
              semanticBlocks.forEach(block => {
                if (block.type === "scene") {
                  newBlocks.push({ id: uid(), type: "scene", text: block.text });
                  pendingChar = "";
                } else if (block.type === "char") {
                  pendingChar = block.text;
                } else if (block.type === "dialogue") {
                  if (block.text || pendingChar) newBlocks.push({ id: uid(), type: "line", name: pendingChar || "", text: block.text });
                  pendingChar = "";
                } else {
                  const stageText = block.type === "paren"
                    ? "(" + block.text.replace(/^\(/, "").replace(/\)$/, "") + ")"
                    : block.text;
                  if (stageText) newBlocks.push({ id: uid(), type: "stage", text: stageText });
                  if (block.type !== "paren") pendingChar = "";
                }
              });
            } else if (currentMode === "short") {
              let pendingChar = "";
              let hookUsed = false;
              semanticBlocks.forEach(block => {
                if (block.type === "scene") {
                  if (block.text) newBlocks.push({ id: uid(), type: "video", text: block.text });
                  pendingChar = "";
                } else if (block.type === "char") {
                  pendingChar = block.text;
                } else if (block.type === "dialogue") {
                  const payload = pendingChar ? `${pendingChar}: ${block.text}` : block.text;
                  if (payload) {
                    newBlocks.push({ id: uid(), type: hookUsed ? "body" : "hook", text: payload });
                    hookUsed = true;
                  }
                  pendingChar = "";
                } else {
                  if (block.text) {
                    newBlocks.push({ id: uid(), type: hookUsed ? "body" : "hook", text: block.text });
                    hookUsed = true;
                  }
                  if (block.type !== "paren") pendingChar = "";
                }
              });
            } else if (currentMode === "media") {
              let pendingChar = "";
              semanticBlocks.forEach(block => {
                if (block.type === "scene") {
                  if (block.text) newBlocks.push({ id: uid(), type: "segment", text: block.text });
                  pendingChar = "";
                } else if (block.type === "action") {
                  if (block.text) newBlocks.push({ id: uid(), type: "anchor", text: block.text });
                  pendingChar = "";
                } else if (block.type === "char") {
                  pendingChar = block.text;
                } else if (block.type === "dialogue") {
                  const payload = pendingChar ? `${pendingChar}: ${block.text}` : block.text;
                  if (payload) newBlocks.push({ id: uid(), type: "sync", text: payload });
                  pendingChar = "";
                } else if (block.type === "paren") {
                  if (block.text) newBlocks.push({ id: uid(), type: "sync", text: "(" + block.text.replace(/^\(/, "").replace(/\)$/, "") + ")" });
                } else if (block.type === "trans") {
                  if (block.text) newBlocks.push({ id: uid(), type: "vtr", text: block.text });
                  pendingChar = "";
                }
              });
            }

            if (newBlocks.length === 0) { alert("Не удалось собрать блоки из DOCX-файла"); return; }
            const nid = "proj_" + Date.now();
            setProjectId(nid);
            setProjectName(importedTitle || file.name.replace(/\.docx$/i, ""));
            setMode(currentMode);
            setBlocks(newBlocks);
            if (currentMode === "play" && importedTitle) {
              setPlayHeader(ph => ph.map(h => h.key === "title" ? { ...h, text: importedTitle } : h));
            }
            if (currentMode === "media" && importedTitle) {
              setMediaHeader(mh => mh.map(h => h.key === "show" ? { ...h, text: importedTitle } : h));
            }
            setFocId(null); setToolbarBlockId(null); lastFocId.current = null;
            setSaved(true); setMenuOpen(false);
          } else if (currentMode === "note") {
            let mammoth;
            try { mammoth = await loadMammothLib(); }
            catch(err) { alert("Не удалось загрузить библиотеку Mammoth для DOCX-импорта."); return; }

            const result = await mammoth.convertToHtml({ arrayBuffer: ev.target.result });
            const html = normalizeNoteHtml(result.value || "");
            if (!html.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim()) {
              alert("Не удалось извлечь текст из DOCX-файла");
              return;
            }

            const nid = "proj_" + Date.now();
            setProjectId(nid);
            setProjectName(file.name.replace(/\.docx$/i, ""));
            setMode("note");
            setBlocks((INIT.note || []).map(b=>({...b})));
            setNoteText(html);
            noteTextRef.current = html;
            setFocId(null); setToolbarBlockId(null); lastFocId.current = null;
            setSaved(true); setMenuOpen(false);
          } else {
            alert("DOCX не поддерживается в этом режиме");
            return;
          }
        } else if (ext === "fdx") {
          /* ─── FDX-импорт через Открыть: отдельная ветка для каждого редактора ─── */
          const parser = new DOMParser();
          const doc = parser.parseFromString(ev.target.result, "application/xml");
          const content = doc.querySelector("Content");
          if (!content) { alert("Не удалось найти <Content> в FDX-файле"); return; }
          const paragraphs = content.querySelectorAll("Paragraph");
          const currentMode = modeRef.current || mode;

          let importedTitle = "";
          let importedAuthor = "";
          const titlePars = doc.querySelectorAll("TitlePage Content Paragraph");
          titlePars.forEach(p => {
            const tp2 = p.getAttribute("Type");
            const txt = (p.querySelector("Text")?.textContent || "").trim();
            if (tp2 === "Title") importedTitle = txt;
            if (tp2 === "Author") importedAuthor = txt;
          });

          if (currentMode === "film") {
            const fdxTypeMap = {
              "Scene Heading":"scene", "Action":"action",
              "Character":"char", "Dialogue":"dialogue",
              "Parenthetical":"paren", "Transition":"trans"
            };
            const newBlocks = [];
            paragraphs.forEach(p => {
              const fdxType = p.getAttribute("Type");
              const texts = p.querySelectorAll("Text");
              let fullText = Array.from(texts).map(t => t.textContent || "").join("");
              let blockType = fdxTypeMap[fdxType] || "action";
              if (blockType === "paren") fullText = fullText.replace(/^\(/, "").replace(/\)$/, "");
              if (blockType === "scene") fullText = fullText.replace(/^\d+\.\s*/, "");
              if (fullText || blockType === "scene") newBlocks.push({ id: uid(), type: blockType, text: fullText });
            });
            if (newBlocks.length === 0) { alert("Не удалось найти содержимое в FDX-файле"); return; }
            const nid = "proj_" + Date.now();
            setProjectId(nid);
            setProjectName(importedTitle || file.name.replace(/\.fdx$/i, ""));
            setMode("film");
            setBlocks(newBlocks);
            setFocId(null); setToolbarBlockId(null); lastFocId.current = null;
            setSaved(true); setMenuOpen(false);
          } else if (currentMode === "play") {
            const newBlocks = [];
            let pendingChar = "";
            paragraphs.forEach(p => {
              const fdxType = p.getAttribute("Type") || "";
              const fullText = Array.from(p.querySelectorAll("Text")).map(t => t.textContent || "").join("").trim();
              if (fdxType === "Scene Heading") {
                newBlocks.push({ id: uid(), type: "scene", text: fullText.replace(/^\d+\.\s*/, "") });
                pendingChar = "";
              } else if (fdxType === "Action") {
                if (fullText) newBlocks.push({ id: uid(), type: "stage", text: fullText });
                pendingChar = "";
              } else if (fdxType === "Character") {
                pendingChar = fullText;
              } else if (fdxType === "Dialogue") {
                if (fullText || pendingChar) newBlocks.push({ id: uid(), type: "line", name: pendingChar || "", text: fullText });
                pendingChar = "";
              } else if (fdxType === "Parenthetical") {
                if (fullText) newBlocks.push({ id: uid(), type: "stage", text: "(" + fullText.replace(/^\(/, "").replace(/\)$/, "") + ")" });
              } else if (fdxType === "Transition") {
                if (fullText) newBlocks.push({ id: uid(), type: "stage", text: fullText });
                pendingChar = "";
              }
            });
            if (newBlocks.length === 0) { alert("Не удалось найти содержимое в FDX-файле"); return; }
            const nid = "proj_" + Date.now();
            setProjectId(nid);
            setProjectName(importedTitle || file.name.replace(/\.fdx$/i, ""));
            setMode("play");
            setBlocks(newBlocks);
            if (importedTitle || importedAuthor) {
              setPlayHeader(ph => ph.map(h => {
                if (h.key === "title" && importedTitle) return { ...h, text: importedTitle };
                if (h.key === "author" && importedAuthor) return { ...h, text: importedAuthor };
                return h;
              }));
            }
            setFocId(null); setToolbarBlockId(null); lastFocId.current = null;
            setSaved(true); setMenuOpen(false);
          } else if (currentMode === "short") {
            const newBlocks = [];
            let pendingChar = "";
            let hookUsed = false;
            paragraphs.forEach(p => {
              const fdxType = p.getAttribute("Type") || "";
              const fullText = Array.from(p.querySelectorAll("Text")).map(t => t.textContent || "").join("").trim();
              if (fdxType === "Scene Heading") {
                if (fullText) newBlocks.push({ id: uid(), type: "video", text: fullText.replace(/^\d+\.\s*/, "") });
                pendingChar = "";
              } else if (fdxType === "Character") {
                pendingChar = fullText;
              } else if (fdxType === "Dialogue") {
                const payload = pendingChar ? `${pendingChar}: ${fullText}` : fullText;
                if (payload) {
                  newBlocks.push({ id: uid(), type: hookUsed ? "body" : "hook", text: payload });
                  hookUsed = true;
                }
                pendingChar = "";
              } else if (fdxType === "Action" || fdxType === "Parenthetical" || fdxType === "Transition") {
                if (fullText) {
                  newBlocks.push({ id: uid(), type: hookUsed ? "body" : "hook", text: fullText });
                  hookUsed = true;
                }
                pendingChar = "";
              }
            });
            if (newBlocks.length === 0) { alert("Не удалось найти содержимое в FDX-файле"); return; }
            const nid = "proj_" + Date.now();
            setProjectId(nid);
            setProjectName(importedTitle || file.name.replace(/\.fdx$/i, ""));
            setMode("short");
            setBlocks(newBlocks);
            setFocId(null); setToolbarBlockId(null); lastFocId.current = null;
            setSaved(true); setMenuOpen(false);
          } else if (currentMode === "media") {
            const newBlocks = [];
            let pendingChar = "";
            paragraphs.forEach(p => {
              const fdxType = p.getAttribute("Type") || "";
              const fullText = Array.from(p.querySelectorAll("Text")).map(t => t.textContent || "").join("").trim();
              if (fdxType === "Scene Heading") {
                if (fullText) newBlocks.push({ id: uid(), type: "segment", text: fullText.replace(/^\d+\.\s*/, "") });
                pendingChar = "";
              } else if (fdxType === "Action") {
                if (fullText) newBlocks.push({ id: uid(), type: "anchor", text: fullText });
                pendingChar = "";
              } else if (fdxType === "Character") {
                pendingChar = fullText;
              } else if (fdxType === "Dialogue") {
                const payload = pendingChar ? `${pendingChar}: ${fullText}` : fullText;
                if (payload) newBlocks.push({ id: uid(), type: "sync", text: payload });
                pendingChar = "";
              } else if (fdxType === "Parenthetical") {
                if (fullText) newBlocks.push({ id: uid(), type: "sync", text: "(" + fullText.replace(/^\(/, "").replace(/\)$/, "") + ")" });
              } else if (fdxType === "Transition") {
                if (fullText) newBlocks.push({ id: uid(), type: "vtr", text: fullText });
                pendingChar = "";
              }
            });
            if (newBlocks.length === 0) { alert("Не удалось найти содержимое в FDX-файле"); return; }
            const nid = "proj_" + Date.now();
            setProjectId(nid);
            setProjectName(importedTitle || file.name.replace(/\.fdx$/i, ""));
            setMode("media");
            setBlocks(newBlocks);
            if (importedTitle) {
              setMediaHeader(mh => mh.map(h => h.key === "show" ? { ...h, text: importedTitle } : h));
            }
            setFocId(null); setToolbarBlockId(null); lastFocId.current = null;
            setSaved(true); setMenuOpen(false);
          } else if (currentMode === "note") {
            const escapeHtml = (s) => String(s || "")
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;");
            const parasHtml = [];
            paragraphs.forEach(p => {
              const fdxType = p.getAttribute("Type") || "";
              const rawText = Array.from(p.querySelectorAll("Text")).map(t => t.textContent || "").join("").trim();
              if (!rawText) return;
              let html = escapeHtml(rawText);
              if (fdxType === "Scene Heading") html = `<h2>${html.replace(/^\d+\.\s*/, "")}</h2>`;
              else if (fdxType === "Character") html = `<p><strong>${html}</strong></p>`;
              else if (fdxType === "Parenthetical") html = `<p><em>${html}</em></p>`;
              else if (fdxType === "Transition") html = `<p><strong>${html}</strong></p>`;
              else html = `<p>${html}</p>`;
              parasHtml.push(html);
            });
            const html = normalizeNoteHtml(parasHtml.join(""));
            if (!html.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim()) { alert("Не удалось найти содержимое в FDX-файле"); return; }
            const nid = "proj_" + Date.now();
            setProjectId(nid);
            setProjectName(importedTitle || file.name.replace(/\.fdx$/i, ""));
            setMode("note");
            setBlocks((INIT.note || []).map(b=>({...b})));
            setNoteText(html);
            noteTextRef.current = html;
            setFocId(null); setToolbarBlockId(null); lastFocId.current = null;
            setSaved(true); setMenuOpen(false);
          } else {
            alert("FDX не поддерживается в этом режиме");
          }
        } else {
          /* ─── .whale JSON-импорт (без изменений) ─── */
          const data = JSON.parse(ev.target.result);
          if (!data.blocks) return;
          const nid = "proj_" + Date.now();
          setProjectId(nid);
          setProjectName(data.name || file.name.replace(".whale",""));
          setMode(data.mode || "film");
          setBlocks(data.blocks.map(b=>({...b})));
          setFocId(null);
          setToolbarBlockId(null);
          lastFocId.current = null;
          if (data.playHeader) setPlayHeader(data.playHeader);
      if (data.mediaHeader) setMediaHeader(data.mediaHeader);
      if (data.contentHeader) setContentHeader(data.contentHeader);
      if (data.contentLogo) setContentLogo(data.contentLogo);
            if (data.noteText !== undefined) { setNoteText(data.noteText); noteTextRef.current = data.noteText; }
          if (data.docFont)    setDocFont(data.docFont);
          if (data.sceneAlign) setSceneAlign(data.sceneAlign);
          setSaved(true);
          setMenuOpen(false);
        }
      } catch(err) { alert("Ошибка чтения файла: " + err.message); }
    };
    if (ext === "docx") reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
    e.target.value = "";
  };

  const saveFile = async (blob, fname, mimeType) => {
    if (window.showSaveFilePicker) {
      try {
        const ext = fname.split(".").pop().toLowerCase();
        const types = [{
          description: fname,
          accept: { [mimeType]: ["."+ext] },
        }];
        const fh = await window.showSaveFilePicker({ suggestedName: fname, types });
        const writable = await fh.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch(e) {
        if (e.name === "AbortError") return; // пользователь отменил
      }
    }
    // Fallback
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const buildExportHTML = (forPDF=false) => {
    // Хелпер: оборачиваем текст блока с форматированием
    const fmt = (b, text) => {
      let t = text || b.text || "";
      if (!t) return "";
      if (b.bold || b.semibold) t = `<strong style="font-weight:${b.bold?"bold":"600"}">${t}</strong>`;
      if (b.italic) t = `<em>${t}</em>`;
      if (b.underline) t = `<u>${t}</u>`;
      if (b.color && b.color !== "#e8e4d8") t = `<span style="color:${b.color}">${t}</span>`;
      return t;
    };
    if (mode === "short") {
      const ch = contentHeader;
      const logoHtml = contentLogo ? `<img src="${contentLogo}" style="width:56px;height:56px;border-radius:8px;object-fit:cover;float:left;margin-right:14px;margin-bottom:8px;">` : "";
      const headerHtml = ch.filter(h=>h.type!=="spacer" && h.text).map(h=>
        `<p style="margin:0 0 5px;font-family:Arial,sans-serif;font-size:${h.size||13}px;font-weight:${h.bold?"bold":"normal"};">${h.text}</p>`
      ).join("");
      const scriptHtml = blocks.map(b=>{
        if(b.type==="scene")  return `<p style="margin:24px 0 4px;font-weight:bold;text-transform:uppercase;">${fmt(b)}</p>`;
        if(b.type==="cast")   return `<p style="margin:0 0 8px;color:#555;font-size:10pt;">${fmt(b)}</p>`;
        if(b.type==="action") return `<p style="margin:8px 0;">${fmt(b)}</p>`;
        if(b.type==="video")  return `<p style="margin:16px 0 4px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">${fmt(b)}</p>`;
        if(b.type==="hook")   return `<p style="margin:8px 0 4px;border-left:3px solid #f472b6;padding-left:10px;font-weight:bold;">${fmt(b)}</p>`;
        if(b.type==="body")   return `<p style="margin:8px 0;border-left:3px solid #60a5fa;padding-left:10px;">${fmt(b)}</p>`;
        if(b.type==="cta")    return `<p style="margin:8px 0;border-left:3px solid #4ade80;padding-left:10px;">${fmt(b)}</p>`;
        if(b.type==="spacer") return `<div style="height:16px"></div>`;
        return "";
      }).join("");
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=794"><style>
        @page{size:A4;margin:25mm 25mm;}
        *{box-sizing:border-box;}
        body{margin:0;padding:0;background:#888;font-family:Arial,sans-serif;font-size:12pt;line-height:1.6;color:#000;width:794px;transform-origin:top left;word-break:break-word;overflow-wrap:break-word;}
        .page{background:#fff;min-height:1123px;padding:60px 60px 60px 60px;box-shadow:0 4px 24px rgba(0,0,0,0.3);margin-bottom:32px;}
        @media print{body{background:#fff;width:auto;} .page{box-shadow:none;margin:0;padding:0;min-height:auto;}}
      </style>
      <script>
      (function(){
        ${forPDF ? '' : "function scale(){if(window.matchMedia('print').matches)return;var s=window.innerWidth/794;document.body.style.transform='scale('+s+')';document.documentElement.style.height=Math.ceil(document.body.scrollHeight*s)+'px';};window.addEventListener('beforeprint',function(){document.body.style.transform='none';document.body.style.width='auto';});window.addEventListener('afterprint',function(){scale();});"}
        ${forPDF ? '' : "document.addEventListener('DOMContentLoaded',scale);window.addEventListener('resize',scale);"}
      })();
      <\/script>
      </head><body>
      <div class="page">
      <div style="border-bottom:2px solid #000;padding-bottom:12px;margin-bottom:24px;">${logoHtml}${headerHtml}<div style="clear:both"></div></div>
      ${scriptHtml}
      </div>
      </body></html>`;
    }
    if (mode === "media") {
      const mh = mediaHeader;
      const headerHtml = mh.map(h => h.type==="spacer"
        ? `<div style="height:${h.size||24}px"></div>`
        : `<p style="margin:0 0 6px;font-family:${h.font||"Arial"},sans-serif;font-size:${h.size||13}px;font-weight:${h.bold?"bold":"normal"};font-style:${h.italic?"italic":"normal"};text-align:${h.align||"left"};">${h.text||""}</p>`
      ).join("");
      let sNum=0;
      const scriptHtml = blocks.map(b=>{
        if(b.type==="segment"){ sNum++; return `<p style="margin:32px 0 8px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid #ccc;padding-bottom:4px;">${fmt(b)}</p>`;}
        if(b.type==="anchor")  return `<p style="margin:8px 0;">${fmt(b)}</p>`;
        if(b.type==="sync")    return `<p style="margin:8px 0;border-left:3px solid #888;padding-left:10px;font-style:italic;">${fmt(b)}</p>`;
        if(b.type==="vtr")     return `<p style="margin:8px 0;color:#555;font-size:11pt;">[ВТР] ${fmt(b)}</p>`;
        if(b.type==="offscreen") return `<p style="margin:8px 0;border-left:3px solid #aaa;padding-left:10px;">${fmt(b)}</p>`;
        if(b.type==="lower3")  return `<p style="margin:6px 0;background:#f0f0f0;padding:4px 8px;font-size:10pt;color:#333;">${fmt(b)}</p>`;
        if(b.type==="question") return `<p style="margin:14px 0 4px;font-weight:bold;">${fmt(b)}</p>`;
        if(b.type==="note")    return `<p style="margin:0 0 8px;color:#666;font-style:italic;font-size:10pt;padding-left:12px;">${fmt(b)}</p>`;
        if(b.type==="spacer")  return `<div style="height:16px"></div>`;
        return "";
      }).join("");
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=794"><style>
        @page{size:A4;margin:25mm 25mm;}
        *{box-sizing:border-box;}
        body{margin:0;padding:0;background:#888;font-family:Arial,sans-serif;font-size:12pt;line-height:1.6;color:#000;width:794px;transform-origin:top left;word-break:break-word;overflow-wrap:break-word;}
        .page{background:#fff;min-height:1123px;padding:60px 60px 60px 60px;box-shadow:0 4px 24px rgba(0,0,0,0.3);margin-bottom:32px;}
        @media print{body{background:#fff;width:auto;} .page{box-shadow:none;margin:0;padding:0;min-height:auto;}}
      </style>
      <script>
      (function(){
        ${forPDF ? '' : "function scale(){if(window.matchMedia('print').matches)return;var s=window.innerWidth/794;document.body.style.transform='scale('+s+')';document.documentElement.style.height=Math.ceil(document.body.scrollHeight*s)+'px';};window.addEventListener('beforeprint',function(){document.body.style.transform='none';document.body.style.width='auto';});window.addEventListener('afterprint',function(){scale();});"}
        ${forPDF ? '' : "document.addEventListener('DOMContentLoaded',scale);window.addEventListener('resize',scale);"}
      })();
      <\/script>
      </head><body>
      <div class="page">
      <div style="border-bottom:2px solid #000;padding-bottom:12px;margin-bottom:24px;">${headerHtml}</div>
      ${scriptHtml}
      </div>
      </body></html>`;
    }
    if (mode === "note") {
      const nt = noteTextRef.current || noteText || "";
      if (forPDF) {
        return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=794">
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: #fff; }
          body { width: 794px; font-family: 'Arial', sans-serif; font-size: 13pt; line-height: 1.8; color: #000; }
          .pdf-export-page { width: 794px; height: 1123px; background: #fff; overflow: hidden; position: relative; margin: 0; }
          .note-source { position: absolute; left: -99999px; top: 0; width: 794px; padding: 88px; visibility: hidden; pointer-events: none; }
          .note-pages { width: 794px; }
          .note-page { padding: 88px; }
          .note-page-content { height: 100%; overflow: hidden; }
          .note-page-content, .note-source-inner {
            font-family: 'Arial', sans-serif;
            font-size: 13pt;
            line-height: 1.8;
            color: #000;
          }
          .note-page-content, .note-page-content *, .note-source-inner, .note-source-inner * {
            max-width: 100%;
            overflow-wrap: anywhere;
            word-break: break-word;
          }
          .note-page-content h1, .note-source-inner h1 { font-size: 20pt; font-weight: bold; margin: 18pt 0 8pt; line-height: 1.3; }
          .note-page-content h2, .note-source-inner h2 { font-size: 15pt; font-weight: bold; margin: 14pt 0 6pt; line-height: 1.3; }
          .note-page-content p, .note-source-inner p { margin: 0 0 8pt; }
          .note-page-content ul, .note-page-content ol, .note-source-inner ul, .note-source-inner ol { margin: 0 0 8pt; padding-left: 24pt; }
          .note-page-content li, .note-source-inner li { margin-bottom: 4pt; }
          .note-page-content img, .note-source-inner img { max-width: 100%; height: auto; }
          .note-page-content pre, .note-source-inner pre { white-space: pre-wrap; }
          @media screen {
            html { background: #888; }
            .note-page { box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
          }
        </style>
        <script>
          (function(){
            function makePage(root){
              var page = document.createElement('div');
              page.className = 'pdf-export-page note-page';
              var content = document.createElement('div');
              content.className = 'note-page-content';
              page.appendChild(content);
              root.appendChild(page);
              return content;
            }

            function createPiece(node){
              if (node.nodeType === 1) return node.cloneNode(false);
              return document.createElement('p');
            }

            function fillSegment(node, content, tokens, start){
              var piece = createPiece(node);
              content.appendChild(piece);
              var low = 1;
              var high = tokens.length - start;
              var best = 0;
              while (low <= high) {
                var mid = Math.floor((low + high) / 2);
                piece.textContent = tokens.slice(start, start + mid).join('');
                if (content.scrollHeight <= content.clientHeight + 1) {
                  best = mid;
                  low = mid + 1;
                } else {
                  high = mid - 1;
                }
              }
              if (!best) {
                content.removeChild(piece);
                return 0;
              }
              piece.textContent = tokens.slice(start, start + best).join('').replace(/^\s+/, '');
              return best;
            }

            function splitNode(node, content, root){
              var text = node.textContent || '';
              var tokens = text.match(/\S+\s*|\s+/g) || [text];
              var index = 0;
              var current = content;
              while (index < tokens.length) {
                var fitted = fillSegment(node, current, tokens, index);
                if (!fitted) {
                  current = makePage(root);
                  fitted = fillSegment(node, current, tokens, index);
                  if (!fitted) break;
                }
                index += fitted;
                if (index < tokens.length) current = makePage(root);
              }
              return current;
            }

            function paginate(){
              var source = document.querySelector('.note-source');
              var sourceInner = document.querySelector('.note-source-inner');
              var root = document.querySelector('.note-pages');
              if (!source || !sourceInner || !root) {
                window.__pdfReady = true;
                return;
              }
              var nodes = Array.from(sourceInner.childNodes).filter(function(node){
                return !(node.nodeType === 3 && !(node.textContent || '').trim());
              });
              var current = makePage(root);
              nodes.forEach(function(node){
                var clone = node.cloneNode(true);
                current.appendChild(clone);
                if (current.scrollHeight > current.clientHeight + 1) {
                  current.removeChild(clone);
                  if (!current.childNodes.length) {
                    current = splitNode(node, current, root);
                  } else {
                    current = makePage(root);
                    var retry = node.cloneNode(true);
                    current.appendChild(retry);
                    if (current.scrollHeight > current.clientHeight + 1) {
                      current.removeChild(retry);
                      current = splitNode(node, current, root);
                    }
                  }
                }
              });
              source.remove();
              window.__pdfReady = true;
            }

            window.__pdfReady = false;
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', paginate);
            } else {
              paginate();
            }
          })();
        <\/script>
        </head><body>
        <div class="note-source"><div class="note-source-inner">${nt}</div></div>
        <div class="note-pages"></div>
        </body></html>`;
      }
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=794">
      <style>
        @page { size: A4; margin: 25mm; }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        body { background: #fff; width: 794px; transform-origin: top left; }
        .note-doc {
          width: 794px;
          min-height: 1123px;
          padding: 88px 88px 88px 88px;
          background: #fff;
          color: #000;
          font-family: 'Arial', sans-serif;
          font-size: 13pt;
          line-height: 1.8;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .note-doc, .note-doc * {
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .note-doc h1 { font-size: 20pt; font-weight: bold; margin: 18pt 0 8pt; line-height: 1.3; }
        .note-doc h2 { font-size: 15pt; font-weight: bold; margin: 14pt 0 6pt; line-height: 1.3; }
        .note-doc p  { margin: 0 0 8pt; }
        .note-doc ul, .note-doc ol { margin: 0 0 8pt; padding-left: 24pt; }
        .note-doc li { margin-bottom: 4pt; }
        .note-doc img { max-width: 100%; height: auto; }
        .note-doc pre { white-space: pre-wrap; }
        @media print {
          html, body { background: #fff; }
          body { width: auto; }
          .note-doc { box-shadow: none; min-height: auto; }
        }
        @media screen {
          html { background: #888; }
          .note-doc { box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
        }
      </style>
      <script>
      (function(){
        function scale(){if(window.matchMedia('print').matches)return;var s=window.innerWidth/794;document.body.style.transform='scale('+s+')';document.documentElement.style.height=Math.ceil(document.body.scrollHeight*s)+'px';};window.addEventListener('beforeprint',function(){document.body.style.transform='none';document.body.style.width='auto';});window.addEventListener('afterprint',function(){scale();});
        document.addEventListener('DOMContentLoaded',scale);window.addEventListener('resize',scale);
      })();
      <\/script>
      </head><body><div class="note-doc">${nt}</div></body></html>`;
    }
    const isPlayMode = mode === "play";
    const tp = isPlayMode ? {
      title:  playHeader.find(h=>h.key==="title")?.text  || "",
      genre:  playHeader.find(h=>h.key==="genre")?.text  || "",
      author: playHeader.find(h=>h.key==="author")?.text || "",
      remark: playHeader.find(h=>h.key==="remark")?.text || "",
      phone: "", email: "", year: "",
    } : titlePage;
    const courier = "'Courier New', Courier, monospace";
    let scriptHtml = "";
    let sceneNum = 0;
    const isPlay = isPlayMode;
    const playFont = `'${docFont||"Times New Roman"}', serif`;
    if (isPlay) {
      let actNum = 0; let sceneInAct = 0;
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        if (b.type === "act") {
          actNum++; sceneInAct = 0;
          scriptHtml += `<p style="margin:32px 0 16px;font-weight:bold;text-transform:uppercase;font-size:13pt;text-align:center;letter-spacing:2px;">${b.text||("АКТ "+actNum)}</p>`;
        } else if (b.type === "scene") {
          sceneInAct++;
          scriptHtml += `<p style="margin:24px 0 4px;font-weight:bold;font-size:12pt;">${b.text||("Сцена "+sceneInAct)}</p>`;
        } else if (b.type === "cast") {
          scriptHtml += `<p style="margin:0 0 16px;font-style:italic;">${b.text||""}</p>`;
        } else if (b.type === "stage") {
          scriptHtml += `<p style="margin:0 0 12px;font-style:italic;">${b.text||""}</p>`;
        } else if (b.type === "line") {
          const name = b.name ? `<strong>${b.name.toUpperCase()}.</strong>  ` : "";
          scriptHtml += `<p style="margin:6px 0;">${name}${b.text||""}</p>`;
        } else if (b.type === "note") {
          scriptHtml += `<p style="margin:8px 0;font-style:italic;color:#555;">${b.text||""}</p>`;
        } else if (b.type === "spacer") {
          scriptHtml += `<p style="margin:0;">&nbsp;</p>`;
        }
      }
    } else {
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        if (b.type === "scene") {
          sceneNum++;
          scriptHtml += `<p style="margin:12pt 0 0 0;font-weight:normal;text-transform:uppercase;line-height:1.2;">${sceneNum}. ${b.text||""}</p>`;
        } else if (b.type === "cast") {
          scriptHtml += `<p style="margin:0;line-height:1.2;">${b.text||""}</p>`;
        } else if (b.type === "action") {
          scriptHtml += `<p style="margin:12pt 0 0 0;line-height:1.2;">${b.text||""}</p>`;
        } else if (b.type === "char") {
          scriptHtml += `<p style="margin:12pt 0 0 0;padding-left:2.2in;text-transform:uppercase;line-height:1.2;">${b.text||""}</p>`;
        } else if (b.type === "dialogue") {
          scriptHtml += `<p style="margin:0;padding-left:1.0in;padding-right:1.5in;line-height:1.2;">${b.text||""}</p>`;
        } else if (b.type === "paren") {
          scriptHtml += `<p style="margin:0;padding-left:1.6in;padding-right:1.5in;font-style:italic;line-height:1.2;">${b.text||""}</p>`;
        } else if (b.type === "trans") {
          scriptHtml += `<p style="margin:12pt 0 0 0;text-align:right;text-transform:uppercase;line-height:1.2;">${b.text||""}</p>`;
        } else if (b.type === "act") {
          scriptHtml += `<p style="margin:24pt 0 12pt 0;text-align:center;font-weight:bold;text-transform:uppercase;line-height:1.2;">${b.text||""}</p>`;
        }
      }
    }
    if (forPDF && !isPlay) {
      return `<!DOCTYPE html><html><head><meta charset="utf-8">
      <meta name="viewport" content="width=794">
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #fff; }
        body { width: 794px; font-family: ${courier}; font-size: 12pt; line-height: 1.7; color: #000; }
        .pdf-export-page { width: 794px; height: 1123px; background: #fff; overflow: hidden; position: relative; margin: 0; }
        .title-page { display: block; padding: 96px 96px 96px 144px; box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
        .title-center { position: absolute; left: 144px; right: 96px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; text-align: center; }
        .title-name { font-size: 12pt; text-transform: uppercase; margin: 0 0 24pt 0; letter-spacing: 1px; text-align: center; }
        .title-genre { font-size: 12pt; margin: 0 0 12pt 0; text-align: center; }
        .title-written { font-size: 12pt; margin: 0 0 6pt 0; text-align: center; }
        .title-author { font-size: 12pt; margin: 0; text-align: center; }
        .title-bottom { position: absolute; left: 144px; right: 96px; bottom: 96px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 12pt; }
        .contacts { line-height: 1.8; }
        .script-source { position: absolute; left: -99999px; top: 0; width: 794px; padding: 96px 96px 96px 144px; visibility: hidden; pointer-events: none; font-family: ${courier}; font-size: 12pt; line-height: 1.6; }
        .script-pages { width: 794px; }
        .script-page { padding: 96px 96px 96px 144px; box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
        .script-page-content { height: 100%; overflow: hidden; font-family: ${courier}; font-size: 12pt; line-height: 1.6; }
      </style>
      <script>
        (function(){
          function makePage(root){
            var page = document.createElement('div');
            page.className = 'pdf-export-page script-page';
            var content = document.createElement('div');
            content.className = 'script-page-content';
            page.appendChild(content);
            root.appendChild(page);
            return content;
          }

          function fillSegment(node, content, tokens, start){
            var piece = node.cloneNode(false);
            content.appendChild(piece);
            var low = 1;
            var high = tokens.length - start;
            var best = 0;
            while (low <= high) {
              var mid = Math.floor((low + high) / 2);
              piece.textContent = tokens.slice(start, start + mid).join('');
              if (content.scrollHeight <= content.clientHeight + 1) {
                best = mid;
                low = mid + 1;
              } else {
                high = mid - 1;
              }
            }
            if (!best) {
              content.removeChild(piece);
              return 0;
            }
            piece.textContent = tokens.slice(start, start + best).join('').replace(/^\s+/, '');
            return best;
          }

          function splitNode(node, content, root){
            var text = node.textContent || '';
            var tokens = text.match(/\S+\s*|\s+/g) || [text];
            var index = 0;
            var current = content;
            while (index < tokens.length) {
              var fitted = fillSegment(node, current, tokens, index);
              if (!fitted) {
                current = makePage(root);
                fitted = fillSegment(node, current, tokens, index);
                if (!fitted) break;
              }
              index += fitted;
              if (index < tokens.length) current = makePage(root);
            }
            return current;
          }

          function paginate(){
            var source = document.querySelector('.script-source');
            var sourceInner = document.querySelector('.script-source-inner');
            var root = document.querySelector('.script-pages');
            if (!source || !sourceInner || !root) {
              window.__pdfReady = true;
              return;
            }
            var nodes = Array.from(sourceInner.children);
            var current = makePage(root);
            nodes.forEach(function(node){
              var clone = node.cloneNode(true);
              current.appendChild(clone);
              if (current.scrollHeight > current.clientHeight + 1) {
                current.removeChild(clone);
                if (!current.children.length) {
                  current = splitNode(node, current, root);
                } else {
                  current = makePage(root);
                  var retry = node.cloneNode(true);
                  current.appendChild(retry);
                  if (current.scrollHeight > current.clientHeight + 1) {
                    current.removeChild(retry);
                    current = splitNode(node, current, root);
                  }
                }
              }
            });
            source.remove();
            window.__pdfReady = true;
          }

          window.__pdfReady = false;
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', paginate);
          } else {
            paginate();
          }
        })();
      <\/script>
      </head><body>
      <div class="title-page pdf-export-page">
        <div class="title-center">
          <p class="title-name">${tp.title||projectName}</p>
          <p class="title-genre">${tp.genre||""}</p>
          ${tp.author ? `<p class="title-written">Автор</p><p class="title-author">${tp.author}</p>` : ""}
        </div>
        <div class="title-bottom">
          <div class="contacts">${[tp.phone,tp.email].filter(Boolean).join("<br>")}</div>
          <div class="year">${tp.year||""}</div>
        </div>
      </div>
      <div class="script-source"><div class="script-source-inner">${scriptHtml}</div></div>
      <div class="script-pages"></div>
      </body></html>`;
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <meta name="viewport" content="width=794">
    <style>
      @page { size: A4; margin: 25.4mm 25.4mm 25.4mm ${isPlay ? "25.4mm" : "38.1mm"}; }
      * { box-sizing: border-box; }
      body { font-family: ${isPlay ? playFont : courier}; font-size: 12pt; line-height: 1.7; color: #000; background: #fff; margin: 0; }
      .title-page { ${isPlay && !titleSepPage ? "" : "page-break-after: always;"} display: flex; flex-direction: column; position: relative; font-family: ${isPlay ? playFont : courier}; }
      @media print { .title-page { height: 100vh; } }
      .title-center { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; padding-top: 22vh; }
      .title-name { font-size: 12pt; text-transform: uppercase; margin-bottom: 24pt; letter-spacing: 1px; text-align: center; }
      .title-genre { font-size: 12pt; margin-bottom: 12pt; text-align: center; }
      .title-written { font-size: 12pt; margin-bottom: 6pt; text-align: center; }
      .title-author { font-size: 12pt; margin-bottom: 0; text-align: center; }
      .title-bottom { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 0; font-size: 12pt; }
      .contacts { line-height: 1.8; }
      .script { font-family: ${isPlay ? playFont : courier}; font-size: 12pt; line-height: 1.6; }
      @media print { body { margin: 0; } }
      @media screen {
        html { background: #888; }
        body { width: 794px; transform-origin: top left; margin: 0; }
        .title-page { height: 1123px; padding: 96px 96px 96px ${isPlay ? "96px" : "144px"}; background:#fff; box-shadow:0 4px 24px rgba(0,0,0,0.3); margin-bottom:0; }
        .script     { min-height: 1123px; padding: 96px 96px 96px ${isPlay ? "96px" : "144px"}; background:#fff; box-shadow:0 4px 24px rgba(0,0,0,0.3); margin-bottom:0; }
        ${isPlay ? "" : `.title-page { display:block; }
        .title-center { position:absolute; left:${isPlay ? "96px" : "144px"}; right:96px; top:50%; transform:translateY(-50%); padding-top:0; }
        .title-bottom { position:absolute; left:${isPlay ? "96px" : "144px"}; right:96px; bottom:96px; }`}
      }
    </style>
    <script>
      (function(){
        ${forPDF ? "" : `
        function scale(){
          if(window.matchMedia('print').matches) return;
          var s = window.innerWidth / 794;
          document.body.style.transform = 'scale('+s+')';
          document.documentElement.style.height = Math.ceil(document.body.scrollHeight * s) + 'px';
        }
        ${forPDF ? '' : "document.addEventListener('DOMContentLoaded', scale); window.addEventListener('resize', scale); window.addEventListener('beforeprint', function(){ document.body.style.transform='none'; document.body.style.width='auto'; }); window.addEventListener('afterprint', function(){ scale(); });"}
        `}
      })();
    <\/script>
    </head><body>
    <div class="title-page">
      ${isPlay ? `
        <div style="display:flex;flex-direction:column;">
          ${playHeader.map(h => h.type==="spacer"
            ? `<div style="height:${h.size||24}px"></div>`
            : `<p style="margin:0 0 4px;font-family:${h.font||"Times New Roman"},serif;font-size:${h.size||14}px;font-weight:${h.bold?"bold":"normal"};font-style:${h.italic?"italic":"normal"};text-decoration:${h.underline?"underline":"none"};text-align:${h.align||"left"};">${h.text||""}</p>`
          ).join("")}
        </div>
      ` : `
      <div class="title-center">
        <p class="title-name">${tp.title||projectName}</p>
        <p class="title-genre">${tp.genre||""}</p>
        ${tp.author ? `<p class="title-written">Автор</p><p class="title-author">${tp.author}</p>` : ""}
      </div>
      <div class="title-bottom">
        <div class="contacts">${[tp.phone,tp.email].filter(Boolean).join("<br>")}</div>
        <div class="year">${tp.year||""}</div>
      </div>
      `}
    </div>
    <div class="script">${scriptHtml}</div>
    </body></html>`;
  };

  const exportPDF = async () => {
    setMenuOpen(false);
    setTitlePageOpen(false);
    const html = buildExportHTML(true);
    const fname = (titlePage.title||projectName||"screenplay") + ".pdf";

    let pdfHandle = null;
    if (window.showSaveFilePicker) {
      try {
        pdfHandle = await window.showSaveFilePicker({
          suggestedName: fname,
          types: [{ description: fname, accept: { "application/pdf": [".pdf"] } }],
        });
      } catch (e) {
        if (e.name === "AbortError") return;
      }
    }

    const iframe = document.createElement("iframe");
    // Start with a tall iframe so browser renders all content
    iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:794px;height:16000px;border:none;visibility:hidden;";
    document.body.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();

    // Wait for fonts, layout and PDF pagination to settle
    await new Promise(r => setTimeout(r, 900));
    for (let i = 0; i < 40; i++) {
      if (iframe.contentWindow && iframe.contentWindow.__pdfReady) break;
      await new Promise(r => setTimeout(r, 100));
    }
    await new Promise(r => setTimeout(r, 100));

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit:"pt", format:"a4", orientation:"portrait" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const SCALE = 2;

      const pageNodes = Array.from(iframe.contentDocument.querySelectorAll('.pdf-export-page'));
      if (pageNodes.length) {
        for (let i = 0; i < pageNodes.length; i++) {
          const canvas = await html2canvas(pageNodes[i], {
            scale: SCALE,
            useCORS: true,
            width: 794,
            height: 1123,
            windowWidth: 794,
            windowHeight: 1123,
            backgroundColor: '#ffffff',
          });
          const imgData = canvas.toDataURL("image/jpeg", 0.95);
          if (i > 0) doc.addPage();
          doc.addImage(imgData, "JPEG", 0, 0, pageW, pageH);
        }
      } else {
        const body = iframe.contentDocument.body;
        const totalH = body.scrollHeight;
        const pageHpx = 1123; // A4 px height at 96dpi

        const fullCanvas = await html2canvas(body, {
          scale: SCALE,
          useCORS: true,
          width: 794,
          height: totalH,
          windowWidth: 794,
          windowHeight: totalH,
          backgroundColor: '#ffffff',
        });

        if (mode === "note") {
          const noteMarginPx = 88;
          const noteChunkPx = Math.max(1, pageHpx - noteMarginPx * 2);
          const pages = Math.ceil(totalH / noteChunkPx);
          for (let i = 0; i < pages; i++) {
            const sliceY = i * noteChunkPx * SCALE;
            const sliceH = Math.min(noteChunkPx * SCALE, fullCanvas.height - sliceY);

            const pageCanvas = document.createElement("canvas");
            pageCanvas.width = fullCanvas.width;
            pageCanvas.height = pageHpx * SCALE;
            const ctx = pageCanvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(
              fullCanvas,
              0,
              sliceY,
              fullCanvas.width,
              sliceH,
              0,
              noteMarginPx * SCALE,
              fullCanvas.width,
              sliceH
            );

            const imgData = pageCanvas.toDataURL("image/jpeg", 0.95);
            if (i > 0) doc.addPage();
            doc.addImage(imgData, "JPEG", 0, 0, pageW, pageH);
          }
        } else {
          const pages = Math.ceil(totalH / pageHpx);
          for (let i = 0; i < pages; i++) {
            const sliceY  = i * pageHpx * SCALE;
            const sliceH  = Math.min(pageHpx * SCALE, fullCanvas.height - sliceY);

            const sliceCanvas = document.createElement("canvas");
            sliceCanvas.width  = fullCanvas.width;
            sliceCanvas.height = sliceH;
            sliceCanvas.getContext("2d").drawImage(
              fullCanvas, 0, sliceY, fullCanvas.width, sliceH,
              0, 0, fullCanvas.width, sliceH
            );

            const imgH    = (sliceH / (pageHpx * SCALE)) * pageH;
            const imgData = sliceCanvas.toDataURL("image/jpeg", 0.95);
            if (i > 0) doc.addPage();
            doc.addImage(imgData, "JPEG", 0, 0, pageW, imgH);
          }
        }
      }

      const pdfBlob = new Blob([doc.output("arraybuffer")], {type:"application/pdf"});
      if (pdfHandle) {
        const writable = await pdfHandle.createWritable();
        await writable.write(pdfBlob);
        await writable.close();
      } else {
        await saveFile(pdfBlob, fname, "application/pdf");
      }
    } finally {
      document.body.removeChild(iframe);
    }
  };

  const showPreview = () => {
    setPreviewHtml(buildExportHTML());
    setPreviewOpen(true);
  };

  const loadDocxLib = () => new Promise((resolve, reject) => {
    const lib = window.docx || window.DocxJS || window.Docx;
    if (lib) { resolve(lib); return; }
    let attempts = 0;
    const check = setInterval(() => {
      const l = window.docx || window.DocxJS || window.Docx;
      if (l) { clearInterval(check); resolve(l); return; }
      if (++attempts > 50) { clearInterval(check); reject(new Error("docx timeout")); }
    }, 100);
  });

  const exportDOCX = async () => {
    setTitlePageOpen(false);
    setMenuOpen(false);
    let docx;
    try { docx = await loadDocxLib(); }
    catch(e) {
      alert("Не удалось загрузить библиотеку docx.js.\n\nЕсли вы открываете файл локально (file://) — это ограничение браузера.\nРазверните приложение на сервере (Vercel) и экспорт заработает.");
      return;
    }

    const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak,
            HeadingLevel, convertInchesToTwip, UnderlineType } = docx;

    const tp = titlePage;
    const isPlayMode = mode === "play";
    const isMediaMode = mode === "media";
    const FONT = isPlayMode ? (docFont||"Times New Roman") : isMediaMode ? "Arial" : "Courier New";
    const SIZE = 24;
    const LINE = { before: 0, after: 0 };

    const txt = (text, opts={}) => new TextRun({ text: text||"", font: FONT, size: SIZE, ...opts });

    // Media mode — own title page + script
    if (mode === "short") {
      const ch = contentHeader;
      const logoRun = contentLogo ? [] : []; // logo not supported in docx easily, skip
      const headerParas = [
        ...ch.filter(h=>h.type!=="spacer" && h.text).map(h => new Paragraph({
          children:[new TextRun({ text:h.text||"", font:"Arial", size:(h.size||13)*2, bold:h.bold||false })],
          spacing:{before:0,after:80},
        })),
        new Paragraph({ border:{bottom:{style:"single",size:6,color:"000000"}}, children:[txt("")], spacing:{before:80,after:0} }),
        new Paragraph({ children:[new PageBreak()] }),
      ];
      const scriptParas = [];
      for (const b of blocks) {
        if(b.type==="scene")  scriptParas.push(new Paragraph({ children:[txt((b.text||"").toUpperCase(),{bold:true})], spacing:{before:360,after:80} }));
        else if(b.type==="hook")     scriptParas.push(new Paragraph({ children:[txt(b.text||"",{bold:true})], spacing:{before:160,after:0} }));
        else if(b.type==="body")     scriptParas.push(new Paragraph({ children:[txt(b.text||"")], indent:{left:convertInchesToTwip(0.3)}, spacing:{before:80,after:0} }));
        else if(b.type==="cta")      scriptParas.push(new Paragraph({ children:[txt(b.text||"",{bold:true})], spacing:{before:160,after:0} }));
        else if(b.type==="action")   scriptParas.push(new Paragraph({ children:[txt(b.text||"")], spacing:{before:80,after:0} }));
        else if(b.type==="spacer")   scriptParas.push(new Paragraph({ children:[txt("")], spacing:{before:160,after:0} }));
      }
      const docShort = new Document({ sections:[{ properties:{}, children:[...headerParas, ...scriptParas] }] });
      const blobShort = await Packer.toBlob(docShort);
      const urlShort = URL.createObjectURL(blobShort);
      const fnameShort = (projectName||"content")+".docx";
      const fileShort = new File([blobShort], fnameShort, {type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
      if (navigator.share && navigator.canShare && navigator.canShare({files:[fileShort]})) {
        try { await navigator.share({files:[fileShort],title:fnameShort}); URL.revokeObjectURL(urlShort); return; } catch(e){}
      }
      saveFile(blobShort, fnameShort, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      return;
    }
    if (isMediaMode) {
      const mh = mediaHeader;
      const titleParasMedia = [
        ...mh.filter(h=>h.type!=="spacer").map(h => new Paragraph({
          children:[new TextRun({ text:h.text||"", font:h.font||"Arial", size:(h.size||13)*2,
            bold:h.bold||false, italics:h.italic||false })],
          spacing:{before:0,after:120},
        })),
        new Paragraph({ border:{bottom:{style:"single",size:6,color:"000000"}}, children:[txt("")], spacing:{before:120,after:0} }),
        new Paragraph({ children:[new PageBreak()] }),
      ];
      const scriptParasMedia = [];
      for (const b of blocks) {
        if (b.type==="segment") {
          scriptParasMedia.push(new Paragraph({
            children:[txt((b.text||"").toUpperCase(), {bold:true})],
            spacing:{before:480,after:120},
            border:{bottom:{style:"single",size:4,color:"999999"}},
          }));
        } else if (b.type==="anchor") {
          scriptParasMedia.push(new Paragraph({ children:[txt(b.text||"")], spacing:{before:120,after:0} }));
        } else if (b.type==="sync") {
          scriptParasMedia.push(new Paragraph({
            children:[txt(b.text||"", {italics:true})],
            indent:{left:convertInchesToTwip(0.5)},
            spacing:{before:120,after:0},
          }));
        } else if (b.type==="vtr") {
          scriptParasMedia.push(new Paragraph({
            children:[txt("[ВТР] "+(b.text||""), {color:"555555"})],
            spacing:{before:120,after:0},
          }));
        } else if (b.type==="offscreen") {
          scriptParasMedia.push(new Paragraph({
            children:[txt(b.text||"")],
            indent:{left:convertInchesToTwip(0.5)},
            spacing:{before:120,after:0},
          }));
        } else if (b.type==="lower3") {
          scriptParasMedia.push(new Paragraph({
            children:[txt("[ПЛАШКА] "+(b.text||""), {color:"666666"})],
            spacing:{before:60,after:60},
          }));
        } else if (b.type==="question") {
          scriptParasMedia.push(new Paragraph({
            children:[txt(b.text||"", {bold:true})],
            spacing:{before:240,after:0},
          }));
        } else if (b.type==="note") {
          scriptParasMedia.push(new Paragraph({
            children:[txt(b.text||"", {italics:true, color:"666666"})],
            spacing:{before:0,after:120},
          }));
        } else if (b.type==="spacer") {
          scriptParasMedia.push(new Paragraph({ children:[txt("")], spacing:{before:240,after:0} }));
        }
      }
      const docMedia = new Document({ sections:[{ properties:{}, children:[...titleParasMedia, ...scriptParasMedia] }] });
      const blobMedia = await Packer.toBlob(docMedia);
      const urlMedia = URL.createObjectURL(blobMedia);
      const fnameMedia = (projectName||"media")+".docx";
      const fileMedia = new File([blobMedia], fnameMedia, {type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
      if (navigator.share && navigator.canShare && navigator.canShare({files:[fileMedia]})) {
        try { await navigator.share({files:[fileMedia],title:fnameMedia}); URL.revokeObjectURL(urlMedia); return; } catch(e){}
      }
      saveFile(blobMedia, fnameMedia, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      return;
    }

    // A4 dimensions
    const A4w = convertInchesToTwip(8.27);
    const A4h = convertInchesToTwip(11.69);
    const leftM = convertInchesToTwip(isPlayMode ? 1 : 1.5);
    const rightM = convertInchesToTwip(1);
    const botM  = convertInchesToTwip(1);
    // Title section: top margin = 3.9" (= A4h/3) → title lands at exactly 1/3 of page
    // Word ignores spacing.before on the first paragraph of a section, so we control position via margin.top
    const titleSecProps = { page: { size:{width:A4w,height:A4h}, margin:{top:convertInchesToTwip(3.9), bottom:botM, left:leftM, right:rightM} } };
    // Script section: standard margins
    const scriptSecProps = { page: { size:{width:A4w,height:A4h}, margin:{top:convertInchesToTwip(1), bottom:botM, left:leftM, right:rightM} } };

    // Title page content — NO leading spacer (margin.top handles vertical position)
    const titleContent = [
      new Paragraph({ alignment: AlignmentType.CENTER, children:[
        txt((tp.title||projectName).toUpperCase(), {bold:false, underline:{type:UnderlineType.SINGLE}})
      ], spacing:{before:0,after:240} }),
      new Paragraph({ alignment: AlignmentType.CENTER, children:[txt(tp.genre||"")], spacing:{before:0,after:240} }),
      tp.author ? new Paragraph({ alignment: AlignmentType.CENTER, children:[txt("Автор")], spacing:{before:240,after:120} }) : null,
      tp.author ? new Paragraph({ alignment: AlignmentType.CENTER, children:[txt(tp.author)], spacing:{before:0,after:0} }) : null,
      // Spacer: printable height remaining after title block ≈ (11.69-3.9-1)" - ~1.2"title ≈ 5.6" → 8064 twips
      // Use slightly less (7200) to ensure contacts stay on same page even with long author block
      new Paragraph({ children:[txt("")], spacing:{before:7200,after:0} }),
      // Contacts: phone+email left, year right (separate paragraph, right-aligned)
      ...(tp.phone||tp.email ? [new Paragraph({
        children:[txt([tp.phone,tp.email].filter(Boolean).join("   "))],
        spacing:{before:0,after:0},
      })] : []),
      tp.year ? new Paragraph({ alignment:AlignmentType.RIGHT, children:[txt(tp.year)], spacing:{before:0,after:0} }) : null,
    ].filter(Boolean);

    // Script paragraphs
    const scriptParas = [];
    let sceneNum = 0;
    for (const b of blocks) {
      if (b.type === "scene") {
        sceneNum++;
        scriptParas.push(new Paragraph({
          children:[txt(`${sceneNum}. ${(b.text||"").toUpperCase()}`, {bold:false})],
          spacing:{before:240,after:0},
          indent:{left:0},
        }));
      } else if (b.type === "cast") {
        scriptParas.push(new Paragraph({
          children:[txt(b.text||"")],
          spacing:{before:0,after:240},
        }));
      } else if (b.type === "action") {
        scriptParas.push(new Paragraph({
          children:[txt(b.text||"")],
          spacing:{before:0,after:240},
        }));
      } else if (b.type === "char") {
        scriptParas.push(new Paragraph({
          children:[txt((b.text||"").toUpperCase())],
          indent:{left:convertInchesToTwip(2.2)},
          spacing:{before:240,after:0},
        }));
      } else if (b.type === "dialogue") {
        scriptParas.push(new Paragraph({
          children:[txt(b.text||"")],
          indent:{left:convertInchesToTwip(1.0), right:convertInchesToTwip(1.5)},
          spacing:{before:0,after:240},
        }));
      } else if (b.type === "paren") {
        scriptParas.push(new Paragraph({
          children:[txt(b.text||"", {italics:true})],
          indent:{left:convertInchesToTwip(1.6), right:convertInchesToTwip(1.5)},
          spacing:{before:0,after:0},
        }));
      } else if (b.type === "trans") {
        scriptParas.push(new Paragraph({
          alignment: AlignmentType.RIGHT,
          children:[txt((b.text||"").toUpperCase())],
          spacing:{before:240,after:240},
        }));
      } else if (b.type === "act") {
        scriptParas.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          children:[txt((b.text||"").toUpperCase(), {bold:true})],
          spacing:{before:480,after:480},
        }));
      } else if (b.type === "stage") {
        scriptParas.push(new Paragraph({
          children:[txt(b.text||"", {italics:true})],
          spacing:{before:0,after:240},
        }));
      } else if (b.type === "line") {
        const runs = [];
        if (b.name) runs.push(txt(b.name.toUpperCase()+".  ", {bold:true}));
        runs.push(txt(b.text||""));
        scriptParas.push(new Paragraph({ children:runs, spacing:{before:120,after:0} }));
      } else if (b.type === "note") {
        scriptParas.push(new Paragraph({
          children:[txt(b.text||"", {italics:true, color:"555555"})],
          spacing:{before:120,after:120},
        }));
      } else if (b.type === "spacer") {
        scriptParas.push(new Paragraph({ children:[txt("")], spacing:{before:240,after:0} }));
      }
    }

    const doc = new Document({
      sections:[
        { properties: titleSecProps,  children: titleContent  },
        { properties: scriptSecProps, children: scriptParas   },
      ]
    });

    const blob = await Packer.toBlob(doc);
    const url  = URL.createObjectURL(blob);
    const fname = (tp.title||projectName||"screenplay") + ".docx";

    // Try share first (iOS), fallback to link
    const file = new File([blob], fname, {type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
    if (navigator.share && navigator.canShare && navigator.canShare({files:[file]})) {
      try { await navigator.share({files:[file], title:fname}); URL.revokeObjectURL(url); return; }
      catch(e) {}
    }
    // Desktop fallback
    await saveFile(blob, fname, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    URL.revokeObjectURL(url);
  };

  const exportTXT = () => {
    if (mode === "note") {
      const fname = (projectName||"блокнот")+".txt";
      const tmp = document.createElement("div");
      tmp.innerHTML = noteTextRef.current || noteText || "";
      const plain = (tmp.innerText || tmp.textContent || "").trim();
      saveFile(new Blob(["\ufeff"+plain],{type:"text/plain;charset=utf-8"}), fname, "text/plain");
      setTitlePageOpen(false);
      return;
    }
    const tp = titlePage;
    const lines = [];
    const center = (s, w=60) => { const p=Math.max(0,Math.floor((w-s.length)/2)); return " ".repeat(p)+s; };
    const wrap = (s, indent=0, width=60) => {
      const words = s.split(" "); const rows = []; let cur = "";
      for (const w of words) {
        if ((cur+" "+w).trim().length > width) { rows.push(" ".repeat(indent)+cur.trim()); cur=w; }
        else cur=(cur+" "+w).trim();
      }
      if(cur) rows.push(" ".repeat(indent)+cur.trim());
      return rows;
    };

    // Title page
    if (mode === "play") {
      // Пьеса — из playHeader
      const ph = playHeader.filter(h=>h.type!=="spacer");
      lines.push("","","","","","","","","","","","","");
      ph.forEach(h => { if(h.text) lines.push(h.text); });
      lines.push("","","","","","","","","","","","","","","","","","","");
      lines.push("=".repeat(60));
      lines.push("","");
    } else if (mode === "short") {
      // Видео — из contentHeader
      const ch = contentHeader.filter(h=>h.type!=="spacer");
      lines.push("","","","","","","","","","","","","");
      ch.forEach(h => { if(h.text) lines.push(h.text); });
      lines.push("","","","","","","","","","","","","","","","","","","");
      lines.push("=".repeat(60));
      lines.push("","");
    } else if (mode === "media") {
      // Медиа — из mediaHeader
      const mh = mediaHeader.filter(h=>h.type!=="spacer");
      lines.push("","","","","","","","","","","","","");
      mh.forEach(h => { if(h.text) lines.push(h.text); });
      lines.push("","","","","","","","","","","","","","","","","","","");
      lines.push("=".repeat(60));
      lines.push("","");
    } else {
      // Film — стандартный (не трогаем)
      lines.push("","","","","","","","","","","","","");
      lines.push(center((tp.title||projectName).toUpperCase()));
      if (tp.genre) lines.push(center(tp.genre));
      lines.push("");
      if (tp.author) { lines.push(center("Автор")); lines.push(center(tp.author)); }
      lines.push("","","","","","","","","","","","","","","","","","","");
      if (tp.phone) lines.push("Тел.: "+tp.phone);
      if (tp.email) lines.push("Email: "+tp.email);
      if (tp.year)  lines.push(tp.year);
      lines.push("","");
      lines.push("=".repeat(60));
      lines.push("","");
    }

    // Media mode TXT
    if (mode === "short") {
      const ch = contentHeader;
      const shortLines = [];
      ch.filter(h=>h.type!=="spacer" && h.text).forEach(h => shortLines.push(h.text));
      shortLines.push("=".repeat(60), "", "");
      for (const b of blocks) {
        if(b.type==="scene")  { shortLines.push("",""); shortLines.push((b.text||"").toUpperCase()); shortLines.push("-".repeat(40)); }
        else if(b.type==="hook")   { shortLines.push(""); shortLines.push("▶ "+(b.text||"")); }
        else if(b.type==="body")   { shortLines.push("  "+(b.text||"")); }
        else if(b.type==="cta")    { shortLines.push(""); shortLines.push("→ "+(b.text||"")); }
        else if(b.type==="action") { shortLines.push(b.text||""); }
        else if(b.type==="spacer") { shortLines.push(""); }
      }
      const textShort = shortLines.join("\n");
      const fnameShort = (projectName||"content")+".txt";
      const fileShort = new File(["\ufeff"+textShort], fnameShort, {type:"text/plain;charset=utf-8"});
      if (navigator.share && navigator.canShare && navigator.canShare({files:[fileShort]})) {
        navigator.share({files:[fileShort],title:fnameShort}).catch(()=>{});
        setTitlePageOpen(false); return;
      }
      saveFile(new Blob(["\ufeff"+textShort],{type:"text/plain;charset=utf-8"}), fnameShort, "text/plain");
      setTitlePageOpen(false); return;
    }
    if (mode === "media") {
      const mh = mediaHeader;
      const mediaLines = [];
      mh.filter(h=>h.type!=="spacer" && h.text).forEach(h => mediaLines.push(h.text));
      mediaLines.push("=".repeat(60), "", "");
      for (const b of blocks) {
        if (b.type==="segment")   { mediaLines.push("",""); mediaLines.push((b.text||"").toUpperCase()); mediaLines.push("-".repeat(40)); }
        else if (b.type==="anchor")    { mediaLines.push(""); mediaLines.push(b.text||""); }
        else if (b.type==="sync")      { mediaLines.push("  | "+(b.text||"")); }
        else if (b.type==="vtr")       { mediaLines.push("[ВТР] "+(b.text||"")); }
        else if (b.type==="offscreen") { mediaLines.push("[ЗАКАДР] "+(b.text||"")); }
        else if (b.type==="lower3")    { mediaLines.push("[ПЛАШКА] "+(b.text||"")); }
        else if (b.type==="question")  { mediaLines.push(""); mediaLines.push("? "+(b.text||"")); }
        else if (b.type==="note")      { mediaLines.push("  ("+( b.text||"")+")"); }
        else if (b.type==="spacer")    { mediaLines.push(""); }
      }
      const textMedia = mediaLines.join("\n");
      const fnameMedia = (projectName||"media")+".txt";
      const fileMedia = new File(["\ufeff"+textMedia], fnameMedia, {type:"text/plain;charset=utf-8"});
      if (navigator.share && navigator.canShare && navigator.canShare({files:[fileMedia]})) {
        navigator.share({files:[fileMedia],title:fnameMedia}).catch(()=>{});
        setTitlePageOpen(false); return;
      }
      saveFile(new Blob(["\ufeff"+textMedia],{type:"text/plain;charset=utf-8"}), fnameMedia, "text/plain");
      setTitlePageOpen(false); return;
    }

    // Script
    let sceneNum = 0; let actNum = 0; let sceneInAct = 0;
    const isPlayTXT = mode === "play";
    for (const b of blocks) {
      if (isPlayTXT) {
        if (b.type==="act") {
          actNum++; sceneInAct=0;
          lines.push("",""); lines.push(center((b.text||("АКТ "+actNum)).toUpperCase())); lines.push("","");
        } else if (b.type==="scene") {
          sceneInAct++;
          lines.push(""); lines.push((b.text||("Сцена "+sceneInAct)));
        } else if (b.type==="cast") {
          lines.push("("+b.text+")"); lines.push("");
        } else if (b.type==="stage") {
          wrap(b.text||"",0,60).forEach(l=>lines.push(l)); lines.push("");
        } else if (b.type==="line") {
          const prefix = b.name ? b.name.toUpperCase()+".  " : "";
          wrap(prefix+(b.text||""),0,60).forEach(l=>lines.push(l)); lines.push("");
        } else if (b.type==="note") {
          lines.push("["+b.text+"]"); lines.push("");
        } else if (b.type==="spacer") {
          lines.push("");
        }
      } else {
        if (b.type==="scene") {
          sceneNum++;
          lines.push(""); lines.push(`${sceneNum}. ${(b.text||"").toUpperCase()}`);
        } else if (b.type==="cast") {
          lines.push(b.text||""); lines.push("");
        } else if (b.type==="action") {
          wrap(b.text||"",0,60).forEach(l=>lines.push(l)); lines.push("");
        } else if (b.type==="char") {
          lines.push(""); lines.push(center((b.text||"").toUpperCase()));
        } else if (b.type==="dialogue") {
          wrap(b.text||"",20,40).forEach(l=>lines.push(l)); lines.push("");
        } else if (b.type==="paren") {
          wrap("("+b.text+")",25,30).forEach(l=>lines.push(l));
        } else if (b.type==="trans") {
          lines.push(""); lines.push(" ".repeat(42)+(b.text||"").toUpperCase()); lines.push("");
        } else if (b.type==="act") {
          lines.push("",""); lines.push(center((b.text||"").toUpperCase())); lines.push("","");
        }
      }
    }

    const text = lines.join("\n");
    const fname = (tp.title||projectName||"screenplay")+".txt";
    const file = new File(["\ufeff"+text], fname, {type:"text/plain;charset=utf-8"});
    if (navigator.share && navigator.canShare && navigator.canShare({files:[file]})) {
      navigator.share({files:[file],title:fname}).catch(()=>{});
      return;
    }
    saveFile(new Blob(["\ufeff"+text],{type:"text/plain;charset=utf-8"}), fname, "text/plain");
    setTitlePageOpen(false);
  };

  const exportFDX = () => {
    const tp = titlePage;
    let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    xml += `<FinalDraft DocumentType="Script" Template="No" Version="3">\n`;
    xml += `<Content>\n`;

    let sceneNum = 0; let actNum = 0; let sceneInAct = 0;
    const isPlayFDX = mode === "play";
    for (const b of blocks) {
      let type = ""; let text = b.text||"";
      if (isPlayFDX) {
        if (b.type==="act")      { actNum++; sceneInAct=0; type="Scene Heading"; text=text.toUpperCase()||("АКТ "+actNum); }
        else if (b.type==="scene")    { sceneInAct++; type="Scene Heading"; text=text||(actNum+"."+sceneInAct); }
        else if (b.type==="cast")     { type="Action"; text="("+text+")"; }
        else if (b.type==="stage")    { type="Action"; }
        else if (b.type==="line")     { type="Action"; text=(b.name?b.name.toUpperCase()+".  ":"")+text; }
        else if (b.type==="note")     { type="Action"; text="["+text+"]"; }
      } else {
        if (b.type==="scene")    { sceneNum++; type="Scene Heading"; text=`${sceneNum}. ${text.toUpperCase()}`; }
        else if (b.type==="cast")    { type="Action"; }
        else if (b.type==="action")  { type="Action"; }
        else if (b.type==="char")    { type="Character"; text=text.toUpperCase(); }
        else if (b.type==="dialogue"){ type="Dialogue"; }
        else if (b.type==="paren")   { type="Parenthetical"; text="("+text+")"; }
        else if (b.type==="trans")   { type="Transition"; text=text.toUpperCase(); }
        else if (b.type==="act")     { type="Action"; text=text.toUpperCase(); }
      }
      if (!type) continue;
      const escaped = text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      xml += `<Paragraph Type="${type}"><Text>${escaped}</Text></Paragraph>\n`;
    }

    xml += `</Content>\n`;
    xml += `<TitlePage><Content>`;
    xml += `<Paragraph Type="Title"><Text>${(tp.title||projectName).toUpperCase()}</Text></Paragraph>`;
    xml += `<Paragraph Type="SubTitle"><Text>${tp.genre||""}</Text></Paragraph>`;
    xml += `<Paragraph Type="WrittenBy"><Text>Автор</Text></Paragraph>`;
    xml += `<Paragraph Type="Author"><Text>${tp.author||""}</Text></Paragraph>`;
    xml += `<Paragraph Type="Contact"><Text>${[tp.phone,tp.email].filter(Boolean).join("  ")}</Text></Paragraph>`;
    xml += `</Content></TitlePage>\n</FinalDraft>`;

    const fname = (tp.title||projectName||"screenplay")+".fdx";
    const file = new File([xml], fname, {type:"application/xml"});
    if (navigator.share && navigator.canShare && navigator.canShare({files:[file]})) {
      navigator.share({files:[file],title:fname}).catch(()=>{});
      return;
    }
    saveFile(new Blob([xml],{type:"application/xml"}), fname, "application/xml");
    setTitlePageOpen(false);
  };

  const updatePlayHeader = (key, field, value) => {
    setPlayHeader(ph => ph.map(item => item.key===key ? {...item,[field]:value} : item));
  };

  const updBlock     = (id, text) => { setBlocks(bs=>bs.map(b=>b.id===id?{...b,text}:b)); markDirty(); };
  const updBlockName = (id, name) => { setBlocks(bs=>bs.map(b=>b.id===id?{...b,name}:b)); markDirty(); };
  const chType       = (id, type) => { setBlocks(bs=>bs.map(b=>b.id===id?{...b,type}:b)); markDirty(); };

  const sceneNum = (blockId) => {
    let n = 0;
    const heads = mode==="play" ? ["act","scene"] : ["scene"];
    for (const b of blocks) { if (heads.includes(b.type)) n++; if (b.id===blockId) return n; }
    return n;
  };

  const addAfter = useCallback((id, type) => {
    const nid = uid();
    const toAdd = type==="scene"
      ? [{id:nid,type:"scene",text:""},{id:uid(),type:"cast",text:""}]
      : type==="line"
      ? [{id:nid,type:"line",name:"",text:""}]
      : [{id:nid,type,text:""}];
    setBlocks(bs=>{ const i=bs.findIndex(b=>b.id===id); const a=[...bs]; a.splice(i+1,0,...toAdd); return a; });
    if (type==="scene" || type==="act") setActiveSceneId(nid);
    markDirty();
    setTimeout(()=>{ blockRefs.current[nid]?.focus(); setFoc(nid); }, 60);
  }, [mode]);

  const delBlock = (id) => {
    if (blocks.length<=1) return;
    const i = blocks.findIndex(b=>b.id===id);
    const b = blocks[i];

    const nb = blocks.filter(x=>x.id!==id);
    setBlocks(nb); markDirty();
    const prev = nb[Math.max(0,i-1)];
    if (prev) setTimeout(()=>blockRefs.current[prev.id]?.focus(), 60);
  };

  const dupScene = (sceneId) => {
    const sceneBlocks = getSceneBlocks(sceneId);
    const newBlocks = sceneBlocks.map(b => ({...b, id: Date.now() + Math.random()}));
    // Insert after original scene's blocks
    const i = blocks.findIndex(b=>b.id===sceneId);
    let end = blocks.length;
    for (let j=i+1; j<blocks.length; j++) {
      if (blocks[j].type==="scene"||blocks[j].type==="act") { end=j; break; }
    }
    const nb = [...blocks.slice(0,end), ...newBlocks, ...blocks.slice(end)];
    setBlocks(nb); markDirty();
  };

  const delScene = (sceneId) => {
    const SCENE_TYPES = ["scene","act","anchor","sync","vtr","offscreen","lower3","question","segment","hook","body","cta","action","video"];
    const cur = blocksRef.current;
    const i = cur.findIndex(b=>b.id===sceneId);
    if (i===-1) return;
    const b0 = cur[i];
    // For single-block types (media/content), just delete the block
    if (["anchor","sync","vtr","offscreen","lower3","question"].includes(b0.type)) {
      const nb2 = cur.filter(b=>b.id!==sceneId); setBlocks(nb2); markDirty(nb2); return;
    }
    // Find end of this scene
    let end = cur.length;
    for (let j=i+1; j<cur.length; j++) {
      if (SCENE_TYPES.includes(cur[j].type)) { end=j; break; }
    }
    const sceneCount = cur.filter(b=>b.type==="scene").length;
    if (b0.type==="scene" && sceneCount<=1) return;
    const nb = [...cur.slice(0,i), ...cur.slice(end)];
    setBlocks(nb); markDirty(nb);
    const prev = nb[Math.max(0,i-1)];
    if (prev) setTimeout(()=>blockRefs.current[prev.id]?.focus(), 60);
  };

  const getSceneBlocks = (sceneId) => {
    const i = blocks.findIndex(b=>b.id===sceneId);
    if (i===-1) return [];
    let end = blocks.length;
    for (let j=i+1; j<blocks.length; j++) {
      if (blocks[j].type==="scene"||blocks[j].type==="act") { end=j; break; }
    }
    return blocks.slice(i, end);
  };

  const moveScene = (fromId, toId) => {
    if (fromId===toId) return;
    const cur = blocksRef.current;
    const i = cur.findIndex(b=>b.id===fromId);
    if (i===-1) return;
    // Определяем типы-головы сцены в зависимости от режима
    const SCENE_TYPES = ["scene","act","segment","video","anchor","sync","vtr","offscreen","lower3","question","hook","body","cta","action"];
    let end = cur.length;
    for (let j=i+1; j<cur.length; j++) {
      if (SCENE_TYPES.includes(cur[j].type)) { end=j; break; }
    }
    const fromBlocks = cur.slice(i, end);
    const nb = cur.filter(b=>!fromBlocks.includes(b));
    const insertAt = nb.findIndex(b=>b.id===toId);
    if (insertAt===-1) return;
    nb.splice(insertAt, 0, ...fromBlocks);
    const moved = [...nb]; setBlocks(moved); markDirty(moved);
  };

  const onKey = (e, block, ctx={}) => {
    if (!defs || defs.length === 0) return;
    const def = defs.find(d=>d.type===block.type)||defs[0];
    if ((e.altKey||e.metaKey) && e.key==="-") {
      e.preventDefault();
      const el = blockRefs.current[block.id];
      if (el) {
        const s=el.selectionStart, en=el.selectionEnd;
        updBlock(block.id, block.text.substring(0,s)+"—"+block.text.substring(en));
        setTimeout(()=>{el.selectionStart=el.selectionEnd=s+1;},0);
      }
      return;
    }
    if (e.key==="Enter" && !e.shiftKey) {
      if (block.type==="line") { e.preventDefault(); addAfter(block.id, "line"); return; }
      e.preventDefault();
      const el = e.target || blockRefs.current[block.id];
      const cursor = el ? el.selectionStart : block.text.length;
      const absCursor = (ctx && typeof ctx.sliceStartAbs === "number") ? (ctx.sliceStartAbs + cursor) : cursor;
      if (el && absCursor > 0 && absCursor < block.text.length && block.type === "dialogue") {
        // Разделяем диалог: часть1 + новый char(то же имя) + новый dialogue(остаток)
        const before = block.text.substring(0, absCursor);
        const after = block.text.substring(absCursor).trimStart();
        // Ищем имя персонажа назад
        let charText = "";
        const currentBlocks = blocks;
        const bi = currentBlocks.findIndex(b => b.id === block.id);
        for (let i = bi - 1; i >= 0; i--) {
          if (currentBlocks[i].type === "char") { charText = currentBlocks[i].text || ""; break; }
          if (currentBlocks[i].type === "scene" || currentBlocks[i].type === "act") break;
        }
        updBlock(block.id, before);
        const charId = uid();
        const dialId = uid();
        setBlocks(bs => {
          const i = bs.findIndex(b => b.id === block.id);
          const a = [...bs];
          a.splice(i + 1, 0,
            { id: charId, type: "char", text: charText },
            { id: dialId, type: "dialogue", text: after }
          );
          return a;
        });
        markDirty();
        setTimeout(() => {
          const newEl = blockRefs.current[dialId];
          if (newEl) { newEl.focus(); newEl.selectionStart = newEl.selectionEnd = 0; }
        }, 0);
      } else if (mode === "film" && el && absCursor > 0 && absCursor < block.text.length && ["action", "paren", "note"].includes(block.type)) {
        const before = block.text.substring(0, absCursor);
        const after = block.text.substring(absCursor).trimStart();
        updBlock(block.id, before);
        const newId = uid();
        setBlocks(bs => {
          const i = bs.findIndex(b => b.id === block.id);
          const a = [...bs];
          a.splice(i + 1, 0, { id: newId, type: block.type, text: after });
          return a;
        });
        markDirty();
        setTimeout(() => {
          const newEl = blockRefs.current[newId];
          if (newEl) { newEl.focus(); newEl.selectionStart = newEl.selectionEnd = 0; }
        }, 0);
      } else {
        addAfter(block.id, def.next||defs[0].type);
      }
      return;
    }
    if (e.key==="Tab") {
      e.preventDefault();
      const PROT = ["scene","line","act"];
      if (!PROT.includes(block.type)) {
        const i = defs.findIndex(d=>d.type===block.type);
        chType(block.id, defs[(i+1)%defs.length].type);
      }
      return;
    }
    if (e.key==="Backspace" && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const el = e.target || blockRefs.current[block.id];
      const selStart = el && typeof el.selectionStart === "number" ? el.selectionStart : 0;
      const selEnd = el && typeof el.selectionEnd === "number" ? el.selectionEnd : 0;
      const isBlankBlock = ((block.text || "").trim() === "");
      if (selStart === 0 && selEnd === 0) {
        const currentSliceStart = (ctx && typeof ctx.sliceStartAbs === "number") ? ctx.sliceStartAbs : 0;
        const isContinuedVisualSlice = (ctx && ctx.isFilmSlice && ctx.continued) || (ctx && ctx.part === "second");
        if (mode === "film" && isContinuedVisualSlice && el) {
          e.preventDefault();
          const root = scrollRef.current || document;
          const nodes = Array.from(root.querySelectorAll('textarea[data-block-id]'));
          const prevEntry = nodes
            .map(node => ({ node, sliceStart: parseInt(node.dataset.sliceStart || "0", 10) || 0 }))
            .filter(x => x.node !== el && String(x.node.dataset.blockId || "") === String(block.id) && x.sliceStart < currentSliceStart)
            .sort((a,b) => b.sliceStart - a.sliceStart)[0];
          if (prevEntry && prevEntry.node) {
            const prevEl = prevEntry.node;
            try { prevEl.focus({ preventScroll: true }); } catch(err) { prevEl.focus(); }
            const pos = prevEl.value.length;
            try { prevEl.setSelectionRange(pos, pos); } catch(err) {}
          }
          return;
        }
        const currentBlocks = blocksRef.current || blocks;
        const bi = currentBlocks.findIndex(b => b.id === block.id);
        if (mode === "film" && bi > 0 && block.type !== "act") {
          const prev = currentBlocks[bi - 1];
          if (prev && prev.type && prev.type !== "act") {
            e.preventDefault();
            if (isBlankBlock) {
              delBlock(block.id);
              setTimeout(() => {
                const prevEl = blockRefs.current[prev.id];
                if (!prevEl) return;
                try { prevEl.focus({ preventScroll: true }); } catch(err) { prevEl.focus(); }
                const pos = (prevEl.value || "").length;
                try { prevEl.setSelectionRange(pos, pos); } catch(err) {}
              }, 0);
              return;
            }
            if (prev.type !== block.type) {
              chType(block.id, prev.type);
              return;
            }
            const prevText = prev.text || "";
            const curText = block.text || "";
            const needsSpace = !!prevText && !!curText && !/\s$/.test(prevText) && !/^\s/.test(curText);
            const joiner = needsSpace ? " " : "";
            const caretPos = prevText.length + joiner.length;
            setBlocks(bs => {
              const prevIdx = bs.findIndex(b => b.id === prev.id);
              const curIdx = bs.findIndex(b => b.id === block.id);
              if (prevIdx < 0 || curIdx < 0 || prevIdx >= curIdx) return bs;
              const mergedPrev = { ...bs[prevIdx], text: (bs[prevIdx].text || "") + joiner + curText };
              const next = [...bs];
              next[prevIdx] = mergedPrev;
              next.splice(curIdx, 1);
              return next;
            });
            markDirty();
            setTimeout(() => {
              const prevEl = blockRefs.current[prev.id];
              if (!prevEl) return;
              try { prevEl.focus({ preventScroll: true }); } catch(err) { prevEl.focus(); }
              try { prevEl.setSelectionRange(caretPos, caretPos); } catch(err) {}
              autoH(prevEl);
            }, 0);
            return;
          }
        }
      }
      if (isBlankBlock && block.type !== "act") {
        e.preventDefault(); delBlock(block.id); return;
      }
    }
    // Cmd+1..9 — смена типа блока по хоткею
    if ((e.ctrlKey||e.metaKey) && /^[1-9]$/.test(e.key)) {
      const target = defs.find(d=>d.hotkey===e.key);
      if (target && !["scene","act"].includes(block.type)) { e.preventDefault(); chType(block.id, target.type); }
    }
  };

  const send = () => {
    if (!aiIn.trim()) return;
    const m = AIM.find(x=>x.id===aiMod);
    if (!m.free && credits<10) {
      setMsgs(p=>[...p,{role:"user",text:aiIn},{role:"ai",text:"Недостаточно кредитов.",model:aiMod}]);
      setAiIn(""); return;
    }
    const q = aiIn;
    setMsgs(p=>[...p,{role:"user",text:q}]);
    setAiIn(""); setAiLoad(true);
    setTimeout(()=>{
      const rs=AIR[aiMod];
      setMsgs(p=>[...p,{role:"ai",text:rs[Math.floor(Math.random()*rs.length)],model:aiMod}]);
      setAiLoad(false);
      if (!m.free) setCredits(c=>Math.max(0,c-12));
    },1400);
  };

  // ── Effects ──────────────────────────────────
  useEffect(()=>{ msgEnd.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  useEffect(()=>{
    const el = sceneListRef.current;
    if (!el) return;
    const handler = (e)=>{ if (_dragSceneId.current) e.preventDefault(); };
    el.addEventListener("touchmove", handler, {passive:false});
    return ()=>el.removeEventListener("touchmove", handler);
  },[dragSceneId]);

  useEffect(()=>{
    const recalc = ()=>Object.values(blockRefs.current).forEach(el=>{if(el)autoH(el);});
    const t = setTimeout(recalc,80);
    window.addEventListener("resize",recalc);
    return ()=>{clearTimeout(t);window.removeEventListener("resize",recalc);};
  },[mode]);

  useEffect(()=>{
    if (mode === "note" && noteEditorRef.current) {
      const html = noteText || "";
      noteEditorRef.current.innerHTML = html;
      noteTextRef.current = html;
      resetNoteHistory(html);
    }
  }, [projectId, mode, isMobile]);

  useLayoutEffect(()=>{
    if (mode !== "film") return;
    const pending = filmEditStateRef.current;
    if (!pending) return;
    let el = null;
    const root = scrollRef.current || document;
    if (pending.sliceStart != null && root && root.querySelectorAll) {
      const nodes = Array.from(root.querySelectorAll('textarea[data-block-id]'));
      el = nodes.find(node => (node.dataset.blockId === String(pending.blockId)) && (((parseInt(node.dataset.sliceStart || "0", 10)) || 0) === pending.sliceStart)) || null;
    }
    if (!el) el = blockRefs.current[pending.blockId];
    if (!el) return;
    const restore = () => {
      const sliceStart = parseInt(el.dataset.sliceStart || "0", 10) || 0;
      const relStart = Math.max(0, Math.min(el.value.length, pending.absStart - sliceStart));
      const relEnd = Math.max(0, Math.min(el.value.length, pending.absEnd - sliceStart));
      try { el.focus({ preventScroll: true }); } catch(e) { el.focus(); }
      try { el.setSelectionRange(relStart, relEnd); } catch(e) {}
      if (scrollRef.current && typeof pending.scrollTop === "number") {
        scrollRef.current.scrollTop = pending.scrollTop;
      }
      filmEditStateRef.current = null;
    };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(restore);
    else setTimeout(restore, 0);
  }, [blocks, mode]);

  useEffect(()=>{
    const el = scrollRef.current;
    if (!el) return;
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(z => Math.min(200, Math.max(50, z + (e.deltaY < 0 ? 10 : -10))));
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  useEffect(()=>{
    if (!isMobile) return;
    const vv = window.visualViewport;
    if (!vv) return;
    let lastH = window.innerHeight;
    let debounceT = null;
    const handler = ()=>{
      const newH = Math.round(vv.height + vv.offsetTop);
      const diff = Math.abs(newH - lastH);
      // Обновляем только при значительном изменении (клавиатура открылась/закрылась)
      if (diff > 50) {
        lastH = newH;
        clearTimeout(debounceT);
        debounceT = setTimeout(() => setViewportH(newH), 80);
      }
      const kbH = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardH(kbH);
      const id = lastFocId.current;
      if (!id) return;
      const el = blockRefs.current[id];
      if (!el || !scrollRef.current) return;
      setTimeout(()=>{
        const elRect = el.getBoundingClientRect();
        const vvBottom = vv.offsetTop + vv.height;
        if (elRect.bottom > vvBottom - 20) {
          scrollRef.current.scrollTop += elRect.bottom - vvBottom + 80;
        }
      }, 100);
    };
    vv.addEventListener("resize", handler);
    return ()=>{ vv.removeEventListener("resize", handler); setKeyboardH(0); };
  },[isMobile]);

  // ══════════════════════════════════════════════
  // SHARED HELPERS for rendering
  // ══════════════════════════════════════════════

  // Структурный блок для film-scene на мобиле
  const renderFilmSceneBlock = (block) => {
    const parts = (block.text||"").split(".").map(s=>s.trim());
    const intExt = parts[0]||"ИНТ";
    const location = parts[1]||"";
    const time = parts[2]||"";
    return (
      <div style={{paddingTop:"28px",paddingBottom:"0"}}>
        <div style={{display:"flex",alignItems:"center",flexWrap:"wrap"}}>
          {/* ИНТ/НАТ */}
          <div style={{display:"flex",background:BG,borderRadius:"8px",boxShadow:SH_IN,padding:"2px"}}>
            {["ИНТ","НАТ"].map(v=>(
              <button key={v} onMouseDown={e=>e.preventDefault()} onClick={()=>{
                setFoc(block.id);
                const p=[...parts]; p[0]=v;
                updBlock(block.id,p.filter(Boolean).join(". ")+".");
              }} style={{
                padding:"5px 10px",border:"none",borderRadius:"6px",
                background:intExt===v?SURF:"transparent",
                boxShadow:intExt===v?SH_SM:"none",
                color:intExt===v?T1:T3,
                fontSize:"12px",fontWeight:"bold",cursor:"pointer",
                fontFamily:"'Courier New',monospace",letterSpacing:"1px",
              }}>{v}.</button>
            ))}
          </div>
          {/* Локация */}
          <input
            value={location}
            onChange={e=>{
              const p=[...parts]; p[1]=e.target.value.toUpperCase();
              updBlock(block.id,p.slice(0,3).filter(Boolean).join(". ")+".");
            }}
            onFocus={()=>setFoc(block.id)}
            onBlur={()=>setTimeout(()=>setFocId(f=>f===block.id?null:f),500)}
            onKeyDown={e=>{
              if (e.key==="Enter") {
                e.preventDefault();
                // ищем cast блок после этой сцены
                const idx = blocks.findIndex(b=>b.id===block.id);
                const castBlock = blocks[idx+1];
                if (castBlock?.type==="cast") {
                  setFoc(castBlock.id);
                  setTimeout(()=>blockRefs.current[castBlock.id]?.focus(), 50);
                }
              }
            }}
            placeholder="ЛОКАЦИЯ"
            style={{
              flex:1,minWidth:"80px",background:"transparent",border:"none",
              borderBottom:`1px solid ${T3}44`,outline:"none",color:T1,
              fontSize:"14px",fontWeight:"bold",fontFamily:"'Courier New',monospace",
              letterSpacing:"1px",padding:"4px 2px",textTransform:"uppercase",
            }}
          />
          {/* Время */}
          <div style={{display:"flex",background:BG,borderRadius:"8px",boxShadow:SH_IN,padding:"2px",flexWrap:"wrap"}}>
            {["ДЕНЬ","НОЧЬ","УТРО","ВЕЧЕР"].map(v=>(
              <button key={v} onMouseDown={e=>e.preventDefault()} onClick={()=>{
                setFoc(block.id);
                const p=[...parts]; p[2]=v;
                updBlock(block.id,p.slice(0,3).filter(Boolean).join(". ")+".");
                const idx=blocks.findIndex(b=>b.id===block.id);
                const castBlock=blocks[idx+1];
                if (castBlock?.type==="cast") setTimeout(()=>{ setFoc(castBlock.id); blockRefs.current[castBlock.id]?.focus(); },80);
              }} style={{
                padding:"5px 8px",border:"none",borderRadius:"6px",
                background:time===v?SURF:"transparent",
                boxShadow:time===v?SH_SM:"none",
                color:time===v?T1:T3,
                fontSize:"11px",cursor:"pointer",fontFamily:"'Courier New',monospace",
              }}>{v}</button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Textarea для play line
  // Сцена в режиме пьесы — с автонумерацией
  const renderPlayScene = (block) => {
    const idx = blocks.findIndex(b=>b.id===block.id);
    let sceneInAct = 0;
    for (let i=0; i<=idx; i++) {
      if (blocks[i].type==="act" && i<idx) sceneInAct=0;
      if (blocks[i].type==="scene") sceneInAct++;
    }
    const autoLabel = "Сцена " + sceneInAct;
    return (
      <textarea
        ref={el=>{blockRefs.current[block.id]=el;if(el)autoH(el);}}
        value={block.text}
        onChange={e=>{updBlock(block.id,e.target.value);autoH(e.target);}}
        onFocus={()=>setFoc(block.id)}
        onBlur={()=>setTimeout(()=>setFocId(f=>f===block.id?null:f),300)}
        onKeyDown={e=>onKey(e,block)}
        placeholder={autoLabel}
        className="scene-ph"
        spellCheck={false} rows={1}
        style={{
          width:"100%",background:"transparent",border:"none",outline:"none",
          resize:"none",overflow:"hidden",
          fontFamily:`${docFont||"Times New Roman"},serif`,
          fontSize:"15px",lineHeight:"1.7",
          fontWeight:"bold",
          textAlign: sceneAlign||"left",
          color:T1,
          boxSizing:"border-box",padding:"16px 0 4px",
          "::placeholder":{color:T1,opacity:1},
        }}
      />
    );
  };

  // Отступ в режиме пьесы
  const renderPlaySpacer = (block) => {
    const focused = focId === block.id;
    return (
      <div
        tabIndex={0}
        onFocus={()=>setFoc(block.id)}
        onKeyDown={e=>onKey(e,block)}
        className="no-print"
        style={{
          height:"24px", width:"100%", cursor:"text", outline:"none",
          borderLeft: focused ? `2px solid ${mc}55` : "2px solid transparent",
          transition:"border .15s", position:"relative",
          display:"flex", alignItems:"center",
        }}
      >
        <span style={{
          color:T3, fontSize:"9px", letterSpacing:"2px",
          opacity: focused ? 0.9 : 0.7, pointerEvents:"none",
          transition:"opacity .15s", paddingLeft:"6px",
          fontFamily:"inherit",
        }}>ОТСТУП</span>
      </div>
    );
  };

  const renderPlayLine = (block) => (
    <div style={{display:"flex",alignItems:"flex-start",paddingTop:"4px",fontFamily:`${docFont||'Times New Roman'},serif`,fontSize:"15px",lineHeight:"1.7"}}>
      <input
        value={block.name||""}
        onChange={e=>updBlockName(block.id,e.target.value)}
        onFocus={()=>setFoc(block.id)}
        onBlur={()=>setTimeout(()=>setFocId(f=>f===block.id?null:f),500)}
        onKeyDown={e=>{if(e.key==="Tab"||e.key==="Enter"){e.preventDefault();blockRefs.current[block.id]?.focus();}}}
        placeholder="Имя" spellCheck={false}
        size={Math.max(3,(block.name||"").length+1)}
        style={{background:"transparent",border:"none",outline:"none",fontWeight:"bold",color:T1,fontFamily:`${docFont||'Times New Roman'},serif`,fontSize:"15px",flexShrink:0,padding:"0",margin:"0",minWidth:"30px"}}
      />
      <span style={{color:T1,fontWeight:"bold",fontSize:"15px",marginRight:"7px",flexShrink:0}}>.</span>
      <textarea
        ref={el=>{blockRefs.current[block.id]=el;if(el)autoH(el);}}
        value={block.text} onChange={e=>{updBlock(block.id,e.target.value);autoH(e.target);}}
        onFocus={()=>setFoc(block.id)}
        onBlur={()=>setTimeout(()=>setFocId(f=>f===block.id?null:f),500)}
        onKeyDown={e=>onKey(e,block)}
        placeholder="текст реплики..." rows={1}
        style={{flex:1,background:"transparent",border:"none",outline:"none",resize:"none",overflow:"hidden",color:T1,fontSize:"15px",lineHeight:"1.7",fontFamily:`${docFont||'Times New Roman'},serif`,boxSizing:"border-box",padding:"0",margin:"0"}}
      />
    </div>
  );

  // Обычная textarea
  const renderTextarea = (block, extraStyle={}) => {
    const def = defs.find(d=>d.type===block.type)||defs[0];
    const UPPER = ["cast","char","scene"];
    return (
      <textarea
        ref={el=>{blockRefs.current[block.id]=el;if(el)autoH(el);}}
        value={block.text}
        onChange={e=>{
          const val = UPPER.includes(block.type) ? e.target.value.toUpperCase() : e.target.value;
          updBlock(block.id, val); autoH(e.target);
        }}
        onFocus={()=>setFoc(block.id)}
        onBlur={()=>setTimeout(()=>{if(document.activeElement!==blockRefs.current[block.id])setFocId(f=>f===block.id?null:f);},300)}
        onKeyDown={e=>onKey(e,block)}
        placeholder={def.ph} spellCheck={spellOn && def.spell} rows={1}
        autoCorrect={spellOn ? "on" : "off"}
        autoComplete="off"
        autoCapitalize={spellOn ? "sentences" : "off"}
        style={{
          width:"100%",background:"transparent",border:"none",outline:"none",
          resize:"none",overflow:"hidden",
          fontSize:"16px",
          lineHeight:mode==="play"?"1.7":"1.85",
          fontFamily:mode==="play"?`${docFont||'Times New Roman'},serif`:"'Courier New',monospace",
          boxSizing:"border-box",padding:"5px 0",
          ...def.st,
          ...(extraStyle.paddingLeft==="0" ? {paddingLeft:0,paddingRight:0,textAlign:"left"} : {}),
          ...extraStyle,
          fontWeight: block.bold ? "bold" : block.semibold ? "600" : def.st?.fontWeight,
          fontStyle: block.italic ? "italic" : def.st?.fontStyle,
          textDecoration: block.underline ? "underline" : def.st?.textDecoration,
          color: block.color || def.st?.color || "#e8e4d8",
        }}
      />
    );
  };

  // Рендер одного блока
  const renderBlock = (block, mobile=false) => {
    const def = defs.find(d=>d.type===block.type)||defs[0];
    const isSceneHead = block.type==="scene"||block.type==="act";
    const num = isSceneHead ? sceneNum(block.id) : null;
    const canDel = mobile && blocks.length > 1;
    return (
      <div key={block.id}
        ref={el=>{if(isSceneHead)sceneRefs.current[block.id]=el;}}
        onClick={()=>setFoc(block.id)}
        style={{position:"relative", minHeight:"28px"}}
      >
        {canDel && (
          <div style={{position:"absolute",top:"4px",right:0,zIndex:10,display:"flex",alignItems:"center"}}>
        {(isSceneHead || block.type==="segment" || block.type==="video") && (
          <div
            onMouseDown={e=>e.preventDefault()}
            onClick={e=>{e.stopPropagation();setSelectedScenes(prev=>{const next=new Set(prev);next.has(block.id)?next.delete(block.id):next.add(block.id);return next;});}}
            style={{
              width:"18px",height:"18px",borderRadius:"5px",flexShrink:0,
              border:`2px solid ${selectedScenes.has(block.id)?mc:T3+"99"}`,
              background:selectedScenes.has(block.id)?mc:T3+"22",
              cursor:"pointer",marginRight:"6px",
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>
            {selectedScenes.has(block.id)&&<span style={{color:"#000",fontSize:"9px",fontWeight:"bold",lineHeight:1}}>✓</span>}
          </div>
        )}
            {/* Цвет блока */}
            {(() => {
              const COLORS = ["#e8e4d8","#f472b6","#60a5fa","#4ade80","#fbbf24","#a78bfa","#f87171","#34d399"];
              const setColor = (color) => {
                setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,color,_colorOpen:false}:b));
                markDirty();
              };
              return (
                <div style={{position:"relative",marginRight:"4px"}}>
                  <button onMouseDown={e=>e.preventDefault()}
                    onClick={e=>{e.stopPropagation();setBlocks(bs=>bs.map(b=>b.id===block.id?{...b,_colorOpen:!b._colorOpen}:b));}}
                    style={{
                      width:"22px",height:"22px",borderRadius:"6px",cursor:"pointer",
                      background:block.color?block.color+"22":BG,
                      border:`2px solid ${block.color||mc+"44"}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      WebkitAppearance:"none",
                    }}>
                    <div style={{width:"8px",height:"8px",borderRadius:"50%",background:block.color||T2}}/>
                  </button>
                  {block._colorOpen && (
                    <div style={{position:"absolute",bottom:"28px",right:0,background:SURF,borderRadius:"12px",
                      boxShadow:"0 8px 24px rgba(0,0,0,0.5)",padding:"8px",zIndex:100,
                      display:"flex",flexWrap:"wrap",width:"104px"}}>
                      {COLORS.map(c=>(
                        <button key={c} onMouseDown={e=>e.preventDefault()}
                          onClick={e=>{e.stopPropagation();setColor(c);}}
                          style={{width:"20px",height:"20px",borderRadius:"50%",background:c,
                            border:block.color===c?"2px solid #fff":"2px solid transparent",
                            cursor:"pointer",marginRight:"4px",marginBottom:"4px",WebkitAppearance:"none"}}/>
                      ))}
                      <button onMouseDown={e=>e.preventDefault()}
                        onClick={e=>{e.stopPropagation();setColor(null);}}
                        style={{width:"20px",height:"20px",borderRadius:"50%",background:"transparent",
                          border:"1px dashed "+T3,cursor:"pointer",fontSize:"10px",color:T3,
                          display:"flex",alignItems:"center",justifyContent:"center",WebkitAppearance:"none"}}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke={T3} strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="1" x2="7" y2="7"/><line x1="7" y1="1" x2="1" y2="7"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
            <button
              onMouseDown={e=>e.preventDefault()}
              onClick={e=>{e.stopPropagation();
                const i=blocks.findIndex(b=>b.id===block.id);
                const copy={...block,id:Date.now()+Math.random()};
                setBlocks([...blocks.slice(0,i+1),copy,...blocks.slice(i+1)]);markDirty();
              }}
              style={{
                background:`${mc}11`,border:`1px solid ${mc}33`,
                borderRadius:"6px",color:mc,fontSize:"13px",lineHeight:1,
                cursor:"pointer",padding:"3px 7px",
              }}>⧉</button>
            <button
              onMouseDown={e=>e.preventDefault()}
              onClick={e=>{e.stopPropagation();delBlock(block.id);}}
              style={{
                background:"#f8717108",border:"1px solid #f8717118",
                borderRadius:"6px",lineHeight:1,marginLeft:"4px",
                cursor:"pointer",padding:"3px 7px",
                display:"flex",alignItems:"center",justifyContent:"center",
              }}><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="1" x2="7" y2="7"/><line x1="7" y1="1" x2="1" y2="7"/></svg></button>
          </div>
        )}
        {block.type==="scene" && (
          <div style={{position:"absolute",top:"-8px",left:0,right:0,height:"1px",
            background:`linear-gradient(to right,transparent,${T3}44,transparent)`}}/>
        )}
        {isSceneHead && num && mode!=="play" && mode!=="media" && (
          <div style={{
            position:"absolute", top: mobile ? "24px" : "32px", left:0,
            color:T2, fontSize:"16px", fontFamily:"'Courier New',monospace",
            fontWeight:"bold", pointerEvents:"none", userSelect:"none",
          }}>{num}.</div>
        )}
        {mobile && mode==="film" && block.type==="scene"
          ? renderTextarea(block, {paddingLeft:"28px", paddingRight:"0", fontWeight:"bold", textTransform:"uppercase", paddingTop:"24px", fontSize:"16px"})
          : mode==="play" && block.type==="spacer"
          ? renderPlaySpacer(block)
          : mode==="play" && block.type==="scene"
          ? renderPlayScene(block)
          : mode==="play" && block.type==="line"
          ? renderPlayLine(block)
          : renderTextarea(block, mobile ? {paddingLeft:"0",paddingRight:"0",textAlign:mode==="film"&&block.type==="trans"?"right":"left"} : {})
        }
      </div>
    );
  };

  // Toolbar buttons (mobile)
  const renderMobileToolbar = () => {
    const curId    = toolbarBlockId || focId || lastFocId.current;
    const curBlock = curId ? blocks.find(b=>b.id===curId) : null;
    const curType  = curBlock?.type;
    const PROT     = ["scene","act"];
    const panelDefs = (defs || []).filter(d => d.type !== "act");
    return (
      <div style={{background:SURF,boxShadow:"0 -2px 16px rgba(0,0,0,0.35)",flexShrink:0}}>
        <div style={{padding:"6px 14px 4px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center"}}>
            <button onMouseDown={e=>e.preventDefault()} onClick={showPreview}
              style={{background:mc+"22",border:`1px solid ${mc}66`,color:mc,fontSize:"8px",
                letterSpacing:"1px",cursor:"pointer",fontFamily:"inherit",
                padding:"5px 10px",borderRadius:"8px",boxShadow:SH_SM,whiteSpace:"nowrap"}}>
              ПРОСМОТР
            </button>
          </div>
          <div style={{display:"flex",alignItems:"center",position:"relative"}}>
            {/* Ж/К/Ч/З — только не в film */}
            {mode!=="film" && (() => {
              const activeId = getActiveBlockId();
              const curBlock = activeId ? blocks.find(b=>b.id===activeId) : null;
              const toggle = (field) => {
                const id = activeId;
                if(!id) return;
                setBlocks(bs=>bs.map(b=>b.id===id?{...b,[field]:!b[field]}:b));
                markDirty();
              };
              const fmtBtn = (field, label, style) => (
                <button key={field} onMouseDown={e=>e.preventDefault()} onClick={()=>toggle(field)}
                  style={{
                    width:"24px",height:"24px",borderRadius:"6px",marginRight:"3px",
                    background:curBlock?.[field]?`${mc}22`:BG,
                    border:`1px solid ${curBlock?.[field]?mc:mc+"33"}`,
                    color:curBlock?.[field]?mc:T2,
                    fontSize:"11px",cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    WebkitAppearance:"none",...style,
                  }}>{label}</button>
              );
              const resetFmt = () => {
                const id = activeId;
                if(!id) return;
                setBlocks(bs=>bs.map(b=>b.id===id?{...b,bold:false,italic:false,underline:false,semibold:false,color:null,_colorOpen:false}:b));
                markDirty();
              };
              const fmtCfg = getFormatConfig(mode);
              return (
                <div style={{display:"flex",alignItems:"center",marginRight:"6px"}}>
                  {fmtCfg.bold && fmtBtn("bold","Ж",{fontWeight:"bold",fontFamily:"serif"})}
                  <button onMouseDown={e=>e.preventDefault()} onClick={resetFmt}
                    style={{width:"24px",height:"24px",borderRadius:"6px",marginRight:"3px",background:BG,border:`1px solid ${mc}33`,color:T2,fontSize:"11px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",WebkitAppearance:"none"}}>Н</button>
                  {fmtCfg.italic && fmtBtn("italic","К",{fontStyle:"italic",fontFamily:"serif"})}
                  {fmtCfg.underline && fmtBtn("underline","Ч",{textDecoration:"underline"})}
                </div>
              );
            })()}
            {(mode==="play" || mode==="media" || mode==="short") && (
              <div style={{position:"relative"}}>
                <button onMouseDown={e=>e.preventDefault()} onClick={()=>setDocFontOpen(o=>!o)}
                  style={{padding:"5px 10px",background:BG,boxShadow:SH_SM,border:`1px solid ${mc}44`,borderRadius:"8px",
                    color:mc,fontSize:"9px",cursor:"pointer",fontFamily:"inherit",letterSpacing:"1px"}}>Аа</button>
                {docFontOpen && (
                  <div style={{position:"absolute",bottom:"28px",right:0,background:SURF,
                    borderRadius:"12px",boxShadow:"0 8px 24px rgba(0,0,0,0.4)",
                    padding:"6px",zIndex:50,minWidth:"160px"}}>
                    {["Times New Roman","Georgia","Palatino","Courier New","Arial","Helvetica"].map(f=>(
                      <button key={f} onMouseDown={e=>e.preventDefault()}
                        onClick={()=>{setDocFont(f);setDocFontOpen(false);}}
                        style={{display:"block",width:"100%",padding:"8px 12px",
                          border:"none",borderRadius:"8px",textAlign:"left",cursor:"pointer",
                          fontFamily:f,fontSize:"13px",
                          color:docFont===f?mc:T1,
                          background:docFont===f?`${mc}15`:"transparent",
                        }}>{f}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button onMouseDown={e=>e.preventDefault()} onClick={()=>setSpellOn(v=>!v)}
              title={spellOn?"Выключить проверку орфографии":"Включить проверку орфографии"}
              style={{padding:"5px 10px",background:spellOn?`${mc}22`:BG,boxShadow:SH_SM,
                border:`1px solid ${spellOn?mc:mc+"44"}`,borderRadius:"8px",
                color:spellOn?mc:mc+"77",fontSize:"9px",cursor:"pointer",
                fontFamily:"inherit",letterSpacing:"1px",position:"relative",whiteSpace:"nowrap",marginLeft:"6px"}}>
              АБВ{spellOn&&<span style={{position:"absolute",top:"-3px",right:"-3px",width:"6px",height:"6px",background:mc,borderRadius:"50%"}}/>}
            </button>
            <div style={{display:"flex",marginLeft:"6px"}}>
              <button onMouseDown={e=>e.preventDefault()}
                onClick={()=>{const last=blocksRef.current[blocksRef.current.length-1];if(!last)return; if(mode==="media"){addAfter(last.id,"segment");}else if(mode==="short"){addAfter(last.id,"video");}else{addAfter(last.id,"scene");}}}
                style={{padding:"5px 10px",background:BG,boxShadow:SH_SM,border:"none",borderRadius:"8px",color:mc,fontSize:"9px",cursor:"pointer",fontFamily:"inherit",letterSpacing:"1px"}}>
                {mode==="media" ? "+ БЛОК" : "+ СЦЕНА"}
              </button>
            </div>
          </div>
        </div>
        <div style={{display:"flex",overflowX:"auto",padding:"6px 12px 10px",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
          {mode==="play" && (
            <button onMouseDown={e=>e.preventDefault()}
              onClick={()=>{const last=blocks[blocks.length-1];if(last)addAfter(last.id,"act");}}
              style={{padding:"5px 12px",background:BG,boxShadow:SH_SM,border:"none",borderRadius:"8px",color:T2,fontSize:"9px",cursor:"pointer",fontFamily:"inherit",letterSpacing:"1px",marginRight:"6px",flexShrink:0}}>
              + АКТ
            </button>
          )}
          {panelDefs.map(d=>{
            const isActive  = curType===d.type;
            return (
              <button key={d.type}
                onMouseDown={e=>e.preventDefault()}
                onClick={()=>{
                  if (!curId||!curBlock) return;
                  // Та же логика что у Героя и Диалога:
                  // если стоишь на этом типе — добавить новый такой же
                  // если стоишь на другом — сменить тип текущего
                  if (d.type === "cast" && curType === "scene") {
                    // перейти на cast блок после scene
                    const i = blocks.findIndex(b=>b.id===curId);
                    const next = blocks[i+1];
                    if (next?.type === "cast") { blockRefs.current[next.id]?.focus(); }
                    else { addAfter(curId, "cast"); }
                    return;
                  }
                  if (curType===d.type) {
                    addAfter(curId, d.type);
                  } else if (!PROT.includes(curType)) {
                    chType(curId, d.type);
                  }
                }}
                style={{
                  flexShrink:0,padding:"8px 14px",
                  background:isActive?BG:`${BG}88`,
                  boxShadow:isActive?SH_IN:SH_SM,
                  border:isActive?`1px solid ${mc}44`:"1px solid transparent",
                  borderRadius:"12px",
                  color:isActive?T1:T2,
                  opacity:1,
                  fontSize:"11px",cursor:"pointer",
                  fontFamily:"inherit",whiteSpace:"nowrap",
                  letterSpacing:"0.5px",transition:"all .08s",
                  display:"flex",alignItems:"center",
                  marginRight:"6px",
                }}>
                <span style={{color:isActive?mc:T3,fontSize:"10px",marginRight:"5px",flexShrink:0}}>{d.hotkey}</span>
                {d.type==="trans"?"Монтаж":d.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════
  // MOBILE LAYOUT
  // ══════════════════════════════════════════════
  if (isMobile) {
    return (
      <div style={{display:"flex",flexDirection:"column",height:`${viewportH}px`,background:BG,fontFamily:"'Courier New',monospace",color:T1,overflow:"hidden"}}>

        {/* ── ШАПКА ── */}
        <div style={{background:SURF,boxShadow:"0 2px 12px rgba(0,0,0,0.4)",flexShrink:0,position:"relative",zIndex:10}}>

          {/* Строка 1: меню — название — статус */}
          <div style={{padding:"10px 14px",display:"flex",alignItems:"center"}}>

            {/* Гамбургер */}
            <button onClick={()=>setMenuOpen(o=>!o)} style={{
              width:"32px",height:"32px",borderRadius:"9px",background:BG,boxShadow:SH_SM,
              border:"none",cursor:"pointer",color:T1,display:"flex",flexDirection:"column",
              alignItems:"center",justifyContent:"center",flexShrink:0,padding:"0",
            }}>
              {[0,1,2].map(i=>(
                <span key={i} style={{display:"block",width:"14px",height:"1.5px",background:T2,borderRadius:"2px",marginTop:i>0?"3px":0}}/>
              ))}
            </button>

            {/* Название проекта */}
            <div style={{flex:1,textAlign:"center"}}>
              {editingName ? (
                <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <input
                    autoFocus
                    value={nameDraft}
                    onChange={e=>setNameDraft(e.target.value)}
                    onKeyDown={e=>{
                      if(e.key==="Enter"){setProjectName(nameDraft);setEditingName(false);}
                      if(e.key==="Escape"){setEditingName(false);setNameDraft(projectName);}
                    }}
                    style={{
                      background:"transparent",border:"none",borderBottom:`1px solid ${mc}`,
                      outline:"none",color:T1,fontSize:"12px",letterSpacing:"2px",
                      textAlign:"center",fontFamily:"'Courier New',monospace",width:"140px",
                    }}
                  />
                  <button onClick={()=>{setProjectName(nameDraft);setEditingName(false);}} style={{
                    background:"transparent",border:"none",color:mc,cursor:"pointer",fontSize:"14px",padding:"0",
                  }}>✓</button>
                  <button onClick={()=>{setEditingName(false);setNameDraft(projectName);}} style={{
                    background:"transparent",border:"none",color:T3,cursor:"pointer",fontSize:"14px",padding:"0",
                  }}>✕</button>
                </div>
              ) : (
                <span
                  onClick={()=>{setNameDraft(projectName);setEditingName(true);}}
                  style={{color:T1,fontSize:"12px",letterSpacing:"2px",cursor:"text",userSelect:"none"}}
                >{projectName}</span>
              )}
            </div>

            {/* Счётчик страниц + статус */}
            <div style={{display:"flex",alignItems:"center",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center"}}>
                <button onMouseDown={e=>e.preventDefault()} onClick={undo} style={{
                  background:"transparent",border:"none",color:T3,
                  cursor:"pointer",padding:"4px 6px",
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M3 13C5 7 11 4 17 6s9 8 7 14"/></svg></button>
                <button onMouseDown={e=>e.preventDefault()} onClick={redo} style={{
                  background:"transparent",border:"none",color:T3,
                  cursor:"pointer",padding:"4px 6px",
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M21 13C19 7 13 4 7 6S-2 14 0 20"/></svg></button>
                <button onClick={()=>setZoom(z=>Math.max(50,z-10))} style={{
                  background:"transparent",border:"none",color:T3,fontSize:"14px",
                  cursor:"pointer",padding:"4px 5px",lineHeight:1,WebkitAppearance:"none",
                }}>−</button>
                <span style={{fontSize:"9px",color:T3,minWidth:"24px",textAlign:"center",letterSpacing:"1px"}}>{zoom}%</span>
                <button onClick={()=>setZoom(z=>Math.min(200,z+10))} style={{
                  background:"transparent",border:"none",color:T3,fontSize:"14px",
                  cursor:"pointer",padding:"4px 5px",lineHeight:1,WebkitAppearance:"none",
                }}>+</button>
              </div>
              <div style={{display:"flex",alignItems:"center"}}>
                <span style={{color:T3,fontSize:"9px",letterSpacing:"1px"}}>{st.pages} стр.</span>
                <div title={saved?"Сохранено":"Не сохранено"} style={{width:"6px",height:"6px",borderRadius:"50%",background:saved?"#4ade80":"#f472b6",boxShadow:saved?"0 0 6px #4ade8088":"0 0 6px #f472b688"}}/>
              </div>
            </div>
          </div>

          {/* Строка 2: вкладки */}
          <div style={{display:"flex",borderTop:`1px solid ${T3}22`}}>
            {[
              {id:"scenes", label: mode==="media" ? "Блоки" : mode==="short" ? "Видео" : "Сцены", guestLocked:true},
              {id:"editor", label:"Редактор", guestLocked:false},
              {id:"ai",     label:"ИИ",       guestLocked:true},
            ].map(t=>{
              const locked = isGuest && t.guestLocked;
              return (
              <button key={t.id} onClick={()=>{ if(!locked) setMobileTab(t.id); }} style={{
                flex:1,padding:"8px 4px",background:"transparent",border:"none",
                borderBottom:`2px solid ${mobileTab===t.id?mc:"transparent"}`,
                color:locked?"#f472b6":mobileTab===t.id?mc:T3,
                fontSize:"10px",letterSpacing:"2px",cursor:locked?"default":"pointer",
                fontFamily:"'Courier New',monospace",transition:"all .2s",
                opacity:locked?0.5:1,
              }}>{t.label.toUpperCase()}</button>
              );
            })}
          </div>
        </div>

        {/* Боковое меню */}
        {menuOpen && (
          <div style={{
            position:"absolute",top:0,left:0,bottom:0,right:0,zIndex:100,
            display:"flex",
          }}>
            {/* Оверлей */}
            <div onClick={()=>setMenuOpen(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}}/>
            {/* Панель */}
            <div style={{
              position:"relative",width:"260px",background:SURF,height:"100%",
              boxShadow:"4px 0 24px rgba(0,0,0,0.5)",display:"flex",flexDirection:"column",
              padding:"0",zIndex:1,overflowY:"auto",
            }}>
              {/* Лого */}
              <div style={{padding:"16px 14px 12px",display:"flex",alignItems:"center",borderBottom:`1px solid ${T3}22`}}>
                <div style={{
                  width:"36px", height:"36px", borderRadius:"10px",
                  background: BG, boxShadow: SH_SM,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                }}>
                  <Whale size={22}/>
                </div>
                <div style={{flex:1, marginLeft:"10px"}}>
                  <div style={{color:T1, fontSize:"12px", letterSpacing:"3px"}}>OLD WHALE</div>
                  <div style={{color:T3, fontSize:"9px", letterSpacing:"2px"}}>РЕДАКТОР</div>
                </div>
              </div>

              {/* Секция: Проект */}
              <div style={{padding:"12px 0"}}>
                <div style={{padding:"4px 20px 8px",color:T3,fontSize:"9px",letterSpacing:"3px"}}>ПРОЕКТ</div>
                {[
                  {label:"Новый проект",  action: newProject,      svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>},
                  {label:"Сохранить",    action: saveNow,          svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>},
                  {label:"Сохранить как", action: saveAs,           svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>},
                  {label:"История",       action: openProjectsList, svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>},
                  {label:"Мои проекты",   action: ()=>{openProjectsList();setMenuOpen(false);}, svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>},
                ].map(({label,action,svg})=>(
                  <button key={label} onClick={action} style={{
                    display:"flex",alignItems:"center",width:"100%",
                    padding:"11px 20px",background:"transparent",border:"none",
                    color:T1,fontSize:"13px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",
                  }}>
                    <span style={{width:"20px",display:"flex",alignItems:"center",justifyContent:"center",color:T2,flexShrink:0,marginRight:"12px"}}>{svg}</span>
                    {label}
                  </button>
                ))}
              </div>

              {/* Секция: Импорт / Экспорт */}
              <div style={{padding:"12px 0",borderTop:`1px solid ${T3}22`}}>
                <div style={{padding:"4px 20px 8px",color:T3,fontSize:"9px",letterSpacing:"3px"}}>ФАЙЛЫ</div>
                <input id="whale-import" type="file" accept=".whale,.fdx,application/json,application/xml" capture={false} onChange={importWhale} style={{display:"none"}}/>
                {[
                  {label:"Экспорт PDF",  sub:"Титульный лист + сценарий", action:()=>{setTitlePageOpen("pdf");setMenuOpen(false);}, locked:false,     svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>},
                  {label:"Экспорт DOCX", sub:"Word документ",              action:()=>{if(!isGuest){setTitlePageOpen("docx");setMenuOpen(false);}}, locked:isGuest, hidden:mode==="note",  svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>},
                  {label:"Экспорт FDX",  sub:"Final Draft",                action:()=>{if(!isGuest){setTitlePageOpen("fdx");setMenuOpen(false);}},  locked:isGuest, hidden:mode==="note"||mode==="media"||mode==="play"||mode==="short", svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="3"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>},
                  {label:"Экспорт TXT",  sub:"Простой текст",              action:()=>{if(!isGuest){setTitlePageOpen("txt");setMenuOpen(false);}},  locked:isGuest, svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>},
                ].map(({label,svg,sub,action,locked,hidden})=>( hidden ? null :
                  <button key={label} onClick={action} style={{
                    display:"flex",alignItems:"flex-start",width:"100%",
                    padding:"11px 20px",background:"transparent",border:"none",
                    color:locked?"#f472b6":T1,fontSize:"13px",
                    cursor:locked?"default":"pointer",fontFamily:"inherit",textAlign:"left",
                    opacity:locked?0.5:1,
                  }}>
                    <span style={{width:"20px",display:"flex",alignItems:"center",justifyContent:"center",color:locked?"#f472b6":T2,flexShrink:0,marginRight:"12px",paddingTop:"2px"}}>{svg}</span>
                    <div style={{flex:1}}>
                      <div>{label}</div>
                      <div style={{color:locked?"#f472b6":T3,fontSize:"10px",marginTop:"2px"}}>{locked?"Войдите чтобы использовать":sub}</div>
                    </div>
                  </button>
                ))}
                <button onClick={()=>openOpenFilePicker("whale-import")} style={{
                  display:"flex",alignItems:"flex-start",width:"100%",
                  padding:"11px 20px",background:"transparent",border:"none",
                  color:T1,fontSize:"13px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",
                }}>
                  <span style={{width:"20px",display:"flex",alignItems:"center",justifyContent:"center",color:T2,flexShrink:0,marginRight:"12px",paddingTop:"2px"}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </span>
                  <div>
                    <div>Открыть</div>
                    <div style={{color:T3,fontSize:"10px",marginTop:"2px"}}>{(mode==="film"?".whale / .fdx / .docx":".whale / .fdx")}</div>
                  </div>
                </button>
              </div>

              {/* Секция: Режим */}
              <div style={{padding:"12px 0",borderTop:`1px solid ${T3}22`}}>
                <div style={{padding:"4px 20px 8px",color:T3,fontSize:"9px",letterSpacing:"3px"}}>РЕЖИМ</div>
                {MODES.map(m=>{
                  const locked = isGuest && m.id!=="note";
                  return (
                  <button key={m.id} onClick={()=>{ if(locked) return; switchMode(m.id);setMenuOpen(false);}} style={{
                    display:"flex",alignItems:"center",width:"100%",
                    padding:"11px 20px",background:mode===m.id?`${mc}18`:"transparent",border:"none",
                    color:locked?"#f472b6":mode===m.id?mc:T1,fontSize:"13px",
                    cursor:locked?"default":"pointer",fontFamily:"inherit",textAlign:"left",
                    opacity:locked?0.5:1,
                  }}>
                    <span style={{fontSize:"16px",width:"20px",display:"flex",alignItems:"center",justifyContent:"center",marginRight:"12px"}}>{m.icon}</span>
                    {m.label}
                    {locked && <span style={{marginLeft:"auto",color:"#f472b6",fontSize:"9px",letterSpacing:"1px"}}>ВОЙТИ</span>}
                    {!locked && mode===m.id && <span style={{marginLeft:"auto",color:mc,fontSize:"11px"}}>✓</span>}
                  </button>
                  );
                })}
              </div>

              {/* Секция: Прочее */}
              <div style={{padding:"12px 0",borderTop:`1px solid ${T3}22`,marginTop:"auto"}}>
                <div style={{padding:"4px 20px 8px",color:T3,fontSize:"9px",letterSpacing:"3px"}}>ПРОЧЕЕ</div>
                <button onClick={()=>{shareProject();setMenuOpen(false);}} style={{
                  display:"flex",alignItems:"center",width:"100%",
                  padding:"11px 20px",background:"transparent",border:"none",
                  color:T1,fontSize:"13px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",
                }}>
                  <span style={{width:"20px",display:"flex",alignItems:"center",justifyContent:"center",color:T2,flexShrink:0,marginRight:"12px"}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  </span>
                  Поделиться
                </button>
                <button onClick={onLogout} style={{
                  display:"flex",alignItems:"center",width:"100%",
                  padding:"11px 20px",background:"transparent",border:"none",
                  color:T1,fontSize:"13px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",
                }}>
                  <span style={{width:"20px",display:"flex",alignItems:"center",justifyContent:"center",color:T2,flexShrink:0,marginRight:"12px"}}>⏻</span>
                  На главную
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно: Титульный лист */}
        {titlePageOpen && (
          <div style={{position:"absolute",inset:0,zIndex:300,background:BG,display:"flex",flexDirection:"column"}}>
            <div style={{padding:"16px 20px",display:"flex",alignItems:"center",borderBottom:`1px solid ${T3}22`,flexShrink:0}}>
              <button onClick={()=>{ setNewProjectOverlay(false); setTitlePageOpen(false); }} style={{background:"transparent",border:"none",color:T2,fontSize:"20px",cursor:"pointer",padding:"0",lineHeight:1}}>←</button>
              <span style={{color:T1,fontSize:"11px",letterSpacing:"3px"}}>{mode==="note" ? "ЭКСПОРТ" : "ТИТУЛЬНЫЙ ЛИСТ"}</span>
            </div>
            <div style={{flex:1,overflow:"auto",padding:"20px"}}>
              {mode==="note" ? (
                <div>
                  <div style={{color:T3,fontSize:"9px",letterSpacing:"3px",marginBottom:"12px"}}>ПРЕДПРОСМОТР</div>
                  <div style={{padding:"16px",background:"#fff",borderRadius:"12px",color:"#000",fontFamily:"Arial,sans-serif",fontSize:"12px",lineHeight:"1.8",maxHeight:"60vh",overflow:"auto",wordBreak:"break-word"}}
                    dangerouslySetInnerHTML={{__html: noteTextRef.current || noteText || "<span style='color:#aaa'>Блокнот пуст</span>"}}
                  />
                </div>
              ) : (mode==="short" ? [
                {key:"title",    label:"ТЕМА",        ph:"Название / тема",        val:contentHeader.find(h=>h.key==="title")?.text||"",    set:v=>setContentHeader(p=>p.map(h=>h.key==="title"?{...h,text:v}:h))},
                {key:"platform", label:"ПЛАТФОРМА",   ph:"YouTube / TikTok / Instagram / ВК", val:contentHeader.find(h=>h.key==="platform")?.text||"", set:v=>setContentHeader(p=>p.map(h=>h.key==="platform"?{...h,text:v}:h))},
                {key:"format",   label:"ФОРМАТ",      ph:"Reels / Shorts / Видео / Stories",  val:contentHeader.find(h=>h.key==="format")?.text||"",   set:v=>setContentHeader(p=>p.map(h=>h.key==="format"?{...h,text:v}:h))},
                {key:"account",  label:"АККАУНТ",     ph:"@ник",                   val:contentHeader.find(h=>h.key==="account")?.text||"",  set:v=>setContentHeader(p=>p.map(h=>h.key==="account"?{...h,text:v}:h))},
                {key:"reach",    label:"ОХВАТ",       ph:"100 000+",               val:contentHeader.find(h=>h.key==="reach")?.text||"",    set:v=>setContentHeader(p=>p.map(h=>h.key==="reach"?{...h,text:v}:h))},
                {key:"pubdate",  label:"ДАТА ВЫХОДА", ph:"дд.мм.гггг",             val:contentHeader.find(h=>h.key==="pubdate")?.text||"",  set:v=>setContentHeader(p=>p.map(h=>h.key==="pubdate"?{...h,text:v}:h))},
              ] : mode==="media" ? [
                {key:"show",    label:"ПРОГРАММА",  ph:"Название программы", val:mediaHeader.find(h=>h.key==="show")?.text||"",    set:v=>setMediaHeader(p=>p.map(h=>h.key==="show"?{...h,text:v}:h))},
                {key:"episode", label:"ВЫПУСК",     ph:"№ выпуска / эпизода", val:mediaHeader.find(h=>h.key==="episode")?.text||"", set:v=>setMediaHeader(p=>p.map(h=>h.key==="episode"?{...h,text:v}:h))},
                {key:"date",    label:"ДАТА ЭФИРА", ph:"дд.мм.гггг",          val:mediaHeader.find(h=>h.key==="date")?.text||"",    set:v=>setMediaHeader(p=>p.map(h=>h.key==="date"?{...h,text:v}:h))},
                {key:"channel", label:"КАНАЛ",      ph:"Название канала",     val:mediaHeader.find(h=>h.key==="channel")?.text||"", set:v=>setMediaHeader(p=>p.map(h=>h.key==="channel"?{...h,text:v}:h))},
                {key:"host",    label:"ВЕДУЩИЙ",    ph:"Имя Фамилия",         val:mediaHeader.find(h=>h.key==="host")?.text||"",    set:v=>setMediaHeader(p=>p.map(h=>h.key==="host"?{...h,text:v}:h))},
              ] : mode==="play" ? [
                {key:"title",   label:"НАЗВАНИЕ",  ph:"Название",     val: playHeader.find(h=>h.key==="title")?.text||"",  set: v=>setPlayHeader(p=>p.map(h=>h.key==="title"?{...h,text:v}:h))},
                {key:"genre",   label:"ЖАНР",      ph:"Жанр",         val: playHeader.find(h=>h.key==="genre")?.text||"",  set: v=>setPlayHeader(p=>p.map(h=>h.key==="genre"?{...h,text:v}:h))},
                {key:"author",  label:"АВТОР",     ph:"Имя Фамилия",  val: playHeader.find(h=>h.key==="author")?.text||"", set: v=>setPlayHeader(p=>p.map(h=>h.key==="author"?{...h,text:v}:h))},
                {key:"remark",  label:"ПРИМЕЧАНИЕ",ph:"Ремарка",      val: playHeader.find(h=>h.key==="remark")?.text||"", set: v=>setPlayHeader(p=>p.map(h=>h.key==="remark"?{...h,text:v}:h))},
              ] : isGuest ? [
                {key:"title",   label:"НАЗВАНИЕ",  ph:"Название", val:titlePage.title,  set:v=>setTitlePage(p=>({...p,title:v}))},
                {key:"author",  label:"ИНИЦИАЛЫ",  ph:"И. Фамилия", val:titlePage.author, set:v=>setTitlePage(p=>({...p,author:v}))},
              ] : [
                {key:"title",   label:"НАЗВАНИЕ",  ph:"Название сценария", val:titlePage.title,  set:v=>setTitlePage(p=>({...p,title:v}))},
                {key:"genre",   label:"ЖАНР",      ph:"драма, фантастика...",val:titlePage.genre, set:v=>setTitlePage(p=>({...p,genre:v}))},
                {key:"author",  label:"АВТОР",     ph:"Имя Фамилия",       val:titlePage.author, set:v=>setTitlePage(p=>({...p,author:v}))},
                {key:"phone",   label:"ТЕЛЕФОН",   ph:"+7 000 000 00 00",  val:titlePage.phone,  set:v=>setTitlePage(p=>({...p,phone:v}))},
                {key:"email",   label:"EMAIL",     ph:"email@example.com", val:titlePage.email,  set:v=>setTitlePage(p=>({...p,email:v}))},
                {key:"year",    label:"ГОД",       ph:new Date().getFullYear()+"",val:titlePage.year,set:v=>setTitlePage(p=>({...p,year:v}))},
              ]).map(({key,label,ph,val,set})=>(
                <div key={key} style={{marginBottom:"16px"}}>
                  <div style={{color:T3,fontSize:"9px",letterSpacing:"3px",marginBottom:"6px"}}>{label}</div>
                  <input
                    value={val}
                    onChange={e=>set(e.target.value)}
                    placeholder={ph}
                    style={{
                      width:"100%",background:SURF,border:`1px solid ${T3}33`,borderRadius:"10px",
                      padding:"12px 14px",color:T1,fontSize:"14px",fontFamily:"inherit",
                      outline:"none",boxSizing:"border-box",
                    }}
                  />
                </div>
              ))}
              {mode==="play" && (
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"12px 14px",background:SURF,borderRadius:"10px",marginBottom:"16px"}}>
                  <span style={{color:T2,fontSize:"12px"}}>Титул на отдельной странице</span>
                  <div onClick={()=>setTitleSepPage(v=>!v)} style={{
                    width:"40px",height:"22px",borderRadius:"11px",cursor:"pointer",
                    background:titleSepPage?mc:T3+"44",position:"relative",transition:"background .2s",flexShrink:0,
                  }}>
                    <div style={{
                      position:"absolute",top:"3px",left:titleSepPage?"19px":"3px",
                      width:"16px",height:"16px",borderRadius:"50%",background:"#fff",
                      transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)",
                    }}/>
                  </div>
                </div>
              )}
              {/* Предпросмотр */}
              {mode!=="note" && (mode==="short" ? (
                <div style={{marginTop:"8px",padding:"16px",background:"#fff",borderRadius:"12px",color:"#000",fontFamily:"Arial,sans-serif",fontSize:"11px",lineHeight:"1.8"}}>
                  <div style={{display:"flex",alignItems:"flex-start",marginBottom:"8px"}}>
                    {contentLogo && <img src={contentLogo} style={{width:"48px",height:"48px",borderRadius:"8px",objectFit:"cover",flexShrink:0}}/>}
                    <div style={{flex:1}}>{contentHeader.filter(h=>h.type!=="spacer").map(h=>(
                      <div key={h.key} style={{fontWeight:h.bold?"bold":"normal",fontSize:h.size?`${h.size*0.75}px`:"11px",marginBottom:"3px"}}>{h.text||<span style={{color:"#aaa"}}>{h.label}</span>}</div>
                    ))}</div>
                  </div>
                  <div style={{borderTop:"2px solid #000",marginTop:"4px"}}/>
                </div>
              ) : mode==="media" ? (
                <div style={{marginTop:"8px",padding:"16px",background:"#fff",borderRadius:"12px",color:"#000",fontFamily:"Arial,sans-serif",fontSize:"11px",lineHeight:"1.8"}}>
                  {mediaHeader.filter(h=>h.type!=="spacer").map(h=>(
                    <div key={h.key} style={{fontWeight:h.bold?"bold":"normal",fontSize:h.size?`${h.size*0.75}px`:"11px",marginBottom:"4px"}}>{h.text||<span style={{color:"#aaa"}}>{h.label}</span>}</div>
                  ))}
                  <div style={{borderTop:"2px solid #000",marginTop:"8px"}}/>
                </div>
              ) : mode==="play" ? (
                <div style={{marginTop:"8px",padding:"16px",background:"#fff",borderRadius:"12px",color:"#000",fontFamily:`${docFont||"Times New Roman"},serif`,fontSize:"11px",lineHeight:"1.7"}}>
                  {playHeader.filter(h=>h.type!=="spacer").map(h=>(
                    <div key={h.key} style={{fontWeight:h.bold?"bold":"normal",fontStyle:h.italic?"italic":"normal",fontSize:h.size?`${h.size*0.75}px`:"11px",textAlign:h.align||"left",marginBottom:"3px"}}>{h.text||<span style={{color:"#aaa"}}>{h.label}</span>}</div>
                  ))}
                </div>
              ) : (
                <div style={{marginTop:"8px",padding:"20px",background:"#fff",borderRadius:"12px",color:"#000",fontFamily:"'Courier New',monospace",fontSize:"11px",lineHeight:"1.6"}}>
                <div style={{height:"40px"}}/>
                <div style={{textAlign:"center",textTransform:"uppercase",marginBottom:"8px",fontWeight:"bold"}}>{titlePage.title||<span style={{color:"#aaa"}}>НАЗВАНИЕ</span>}</div>
                <div style={{textAlign:"center",marginBottom:"4px"}}>{titlePage.genre||<span style={{color:"#aaa"}}>жанр</span>}</div>
                <div style={{textAlign:"center",marginBottom:"3px",color:"#555",fontSize:"10px"}}>Автор</div>
                <div style={{textAlign:"center",marginBottom:"20px"}}>{titlePage.author||<span style={{color:"#aaa"}}>Имя Фамилия</span>}</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"#555"}}>
                  <div>{[titlePage.phone,titlePage.email].filter(Boolean).join("\n")||<span style={{color:"#ccc"}}>контакты</span>}</div>
                  <div>{titlePage.year}</div>
                </div>
              </div>
              ))}
            </div>
            <div style={{padding:"16px 20px",borderTop:`1px solid ${T3}22`,flexShrink:0}}>
              <div style={{position:"relative",display:"flex",flexDirection:"column",gap:"10px"}}>
                <button onClick={showPreview} style={{
                    width:"100%",padding:"10px",background:"transparent",border:`1px solid ${T3}44`,
                    borderRadius:"12px",color:T2,fontSize:"11px",cursor:"pointer",
                    fontFamily:"inherit",letterSpacing:"2px",
                    opacity:newProjectOverlay?0:1,pointerEvents:newProjectOverlay?"none":"auto",
                  }}>◉ ПРЕДПРОСМОТР</button>
                <button onClick={
                  titlePageOpen==="docx" ? exportDOCX :
                  titlePageOpen==="fdx"  ? exportFDX  :
                  titlePageOpen==="txt"  ? exportTXT  : exportPDF
                } style={{
                  width:"100%",padding:"14px",background:SURF,border:`1px solid ${mc}44`,
                  borderRadius:"12px",color:mc,fontSize:"12px",cursor:"pointer",
                  fontFamily:"inherit",letterSpacing:"2px",boxShadow:SH_SM,
                  opacity:newProjectOverlay?0:1,pointerEvents:newProjectOverlay?"none":"auto",
                }}>{titlePageOpen==="pdf"?"⎙ ЭКСПОРТ PDF":titlePageOpen==="docx"?"W ЭКСПОРТ DOCX":titlePageOpen==="fdx"?"F ЭКСПОРТ FDX":"T ЭКСПОРТ TXT"}</button>
                {newProjectOverlay && (
                  <div style={{position:"absolute",inset:0,background:BG,display:"flex",alignItems:"center",justifyContent:"center",padding:"6px",boxSizing:"border-box"}}>
                    <button onClick={finishNewProjectOverlay} style={{
                      width:"100%",padding:"14px",background:SURF,border:`1px solid ${mc}44`,
                      borderRadius:"12px",color:mc,fontSize:"12px",cursor:"pointer",
                      fontFamily:"inherit",letterSpacing:"2px",boxShadow:SH_SM,
                    }}>СОЗДАТЬ</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно: Предпросмотр */}
        {previewOpen && (
          <div onClick={()=>setPreviewOpen(false)} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.85)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",padding:"20px 16px 16px"}}>
            <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:"860px",display:"flex",flexDirection:"column",height:"100%"}}>
              <div style={{display:"flex",alignItems:"center",flexShrink:0}}>
                <span style={{color:"#fff",fontSize:"11px",letterSpacing:"3px",flex:1}}>ПРЕДПРОСМОТР</span>
                <button onClick={()=>{ const f=document.querySelector('iframe[title="Предпросмотр"]'); if(f){f.contentWindow.focus();f.contentWindow.print();} }} style={{padding:"7px 14px",background:"transparent",border:"1px solid #ffffff44",borderRadius:"12px",color:"#fff",fontSize:"14px",cursor:"pointer",lineHeight:1}}>⎙</button>
                <button onClick={()=>{ setPreviewOpen(false); setTitlePageOpen("pdf"); }} style={{padding:"7px 20px",background:"#fff",border:"none",borderRadius:"12px",color:"#000",fontSize:"10px",letterSpacing:"2px",cursor:"pointer",fontFamily:"inherit"}}>⎙ СОХРАНИТЬ PDF</button>
                <button onClick={()=>setPreviewOpen(false)} style={{padding:"7px 16px",background:"transparent",border:"1px solid #ffffff44",borderRadius:"12px",color:"#fff",fontSize:"10px",letterSpacing:"2px",cursor:"pointer",fontFamily:"inherit"}}>✕</button>
              </div>
              <iframe
                srcDoc={previewHtml}
                style={{flex:1,width:"100%",border:"none",borderRadius:"12px",background:"#fff"}}
                title="Предпросмотр"
              />
            </div>
          </div>
        )}

        {/* Модальное окно: Экспорт */}
        {exportUrl && (
          <div style={{position:"absolute",inset:0,zIndex:300,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
            <div style={{background:SURF,borderRadius:"20px",padding:"24px",width:"100%",maxWidth:"340px",boxShadow:"0 16px 48px rgba(0,0,0,0.5)"}}>
              <div style={{color:T1,fontSize:"11px",letterSpacing:"3px",marginBottom:"4px"}}>ЭКСПОРТ</div>
              <div style={{color:T3,fontSize:"12px",marginBottom:"16px"}}>{exportName}</div>
              <div style={{color:T3,fontSize:"11px",marginBottom:"8px",letterSpacing:"1px"}}>СОДЕРЖИМОЕ ФАЙЛА — скопируй и сохрани как {exportName}</div>
              <textarea
                readOnly
                value={exportUrl}
                onFocus={e=>e.target.select()}
                style={{
                  width:"100%",height:"140px",background:BG,border:`1px solid ${T3}33`,
                  borderRadius:"10px",padding:"10px",color:T2,fontSize:"10px",
                  fontFamily:"monospace",resize:"none",boxSizing:"border-box",
                  outline:"none",marginBottom:"16px",
                }}
              />
              <button onClick={()=>{
                try{navigator.clipboard.writeText(exportUrl);}catch(e){}
              }} style={{
                width:"100%",padding:"12px",background:BG,border:`1px solid ${T3}33`,
                borderRadius:"10px",color:T1,fontSize:"12px",cursor:"pointer",
                fontFamily:"inherit",letterSpacing:"1px",marginBottom:"10px",boxShadow:SH_SM,
              }}>КОПИРОВАТЬ</button>
              <button onClick={()=>setExportUrl(null)} style={{
                width:"100%",padding:"11px",background:BG,border:"none",borderRadius:"10px",
                color:T2,fontSize:"12px",cursor:"pointer",fontFamily:"inherit",boxShadow:SH_SM,
              }}>Закрыть</button>
            </div>
          </div>
        )}

        {/* Модальное окно: Сохранить как */}
        {saveAsOpen && (
          <div onClick={()=>setSaveAsOpen(false)} style={{position:"absolute",inset:0,zIndex:300,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
            <div onClick={e=>e.stopPropagation()} style={{background:SURF,borderRadius:"20px",padding:"24px",width:"100%",maxWidth:"340px",boxShadow:"0 16px 48px rgba(0,0,0,0.5)"}}>
              <div style={{color:T1,fontSize:"11px",letterSpacing:"3px",marginBottom:"16px"}}>СОХРАНИТЬ КАК</div>
              <input
                autoFocus
                value={saveAsName}
                onChange={e=>setSaveAsName(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")confirmSaveAs(saveAsName);if(e.key==="Escape")setSaveAsOpen(false);}}
                placeholder="Название проекта"
                style={{
                  width:"100%",background:BG,border:`1px solid ${T3}44`,borderRadius:"10px",
                  padding:"12px 14px",color:T1,fontSize:"14px",fontFamily:"inherit",
                  outline:"none",boxSizing:"border-box",marginBottom:"16px",
                }}
              />
              <div style={{display:"flex"}}>
                <button onClick={()=>setSaveAsOpen(false)} style={{
                  flex:1,padding:"11px",background:BG,border:"none",borderRadius:"10px",
                  color:T2,fontSize:"12px",cursor:"pointer",fontFamily:"inherit",boxShadow:SH_SM,
                }}>Отмена</button>
                <button onClick={()=>confirmSaveAs(saveAsName)} style={{
                  flex:2,padding:"11px",background:SURF,border:`1px solid ${mc}55`,borderRadius:"10px",
                  color:"#fff",fontSize:"12px",cursor:"pointer",fontFamily:"inherit",letterSpacing:"1px",
                }}>СОХРАНИТЬ</button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно: список проектов */}
        {projectsOpen && (
          <div style={{position:"absolute",inset:0,zIndex:200,background:BG,display:"flex",flexDirection:"column"}}>
            <div style={{padding:"16px 20px",display:"flex",alignItems:"center",borderBottom:`1px solid ${T3}22`,flexShrink:0}}>
              <button onClick={()=>setProjectsOpen(false)} style={{background:"transparent",border:"none",color:T2,fontSize:"20px",cursor:"pointer",padding:"0",lineHeight:1}}>←</button>
              <span style={{color:T1,fontSize:"11px",letterSpacing:"3px"}}>МОИ ПРОЕКТЫ</span>
            </div>
            <div style={{flex:1,overflow:"auto",padding:"12px"}}>
              {projectsList.length===0 && (
                <div style={{color:T3,fontSize:"13px",textAlign:"center",paddingTop:"40px",letterSpacing:"1px"}}>Нет сохранённых проектов</div>
              )}
              {projectsList.map(p=>(
                <div key={p.id} style={{
                  padding:"14px 16px",borderRadius:"14px",marginBottom:"8px",
                  background:p.id===projectId?BG:SURF,
                  boxShadow:p.id===projectId?SH_IN:SH_SM,
                  borderLeft:`3px solid ${p.id===projectId?mc:"transparent"}`,
                  display:"flex",alignItems:"center",
                }}>
                  <div style={{flex:1,cursor:"pointer"}} onClick={()=>{
                    try {
                      const data = JSON.parse(localStorage.getItem("ow_proj_"+p.id)||"null");
                      if (data) loadProject(data);
                    } catch(e) {}
                  }}>
                    <div style={{color:T1,fontSize:"14px",marginBottom:"4px"}}>{p.name||"Без названия"}</div>
                    <div style={{color:T3,fontSize:"10px",letterSpacing:"1px"}}>
                      {new Date(p.updatedAt).toLocaleDateString("ru",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                      {" · "}{p.blocksCount||0} сц.
                    </div>
                  </div>
                  {p.id!==projectId && (
                    <button onClick={()=>deleteProject(p.id)} style={{
                      background:"#f8717108",border:"1px solid #f8717118",
                      borderRadius:"6px",lineHeight:1,flexShrink:0,marginLeft:"4px",
                      cursor:"pointer",padding:"3px 7px",
                      display:"flex",alignItems:"center",justifyContent:"center",
                    }}><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="1" x2="7" y2="7"/><line x1="7" y1="1" x2="1" y2="7"/></svg></button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content area */}
        <div style={{flex:1,overflow:"hidden",position:"relative"}}>

          {/* SCENES */}
          {mobileTab==="scenes" && (
            <div ref={sceneListRef} style={{height:"100%",overflow:"auto",padding:"12px"}}>
              <div style={{display:"flex",marginBottom:"8px",height:"44px",flexShrink:0,position:"relative"}}>
                  {/* Тост */}
                  {copyToast && (
                    <div style={{
                      position:"absolute", top:"-32px", left:"50%", transform:"translateX(-50%)",
                      background:mc, color:"#000", fontSize:"9px", letterSpacing:"1px",
                      padding:"4px 10px", borderRadius:"8px", whiteSpace:"nowrap",
                      pointerEvents:"none", zIndex:100,
                    }}>✓ СКОПИРОВАНО</div>
                  )}
                  <button onClick={copySelectedScenes} style={{
                    flex:1,padding:"10px",
                    background:selectedScenes.size>0?(copyToast?"#4ade80":mc):"transparent",
                    border:"none",borderRadius:"12px",
                    color:selectedScenes.size>0?"#000":"transparent",
                    fontSize:"11px",letterSpacing:"2px",cursor:selectedScenes.size>0?"pointer":"default",fontFamily:"inherit",fontWeight:"bold",
                    pointerEvents:selectedScenes.size>0?"auto":"none",
                    WebkitAppearance:"none",
                    transition:"background .3s",
                  }}>{copyToast ? "✓ СКОПИРОВАНО" : `КОПИРОВАТЬ (${selectedScenes.size})`}</button>
                  <button onClick={()=>setSelectedScenes(new Set())} style={{
                    padding:"10px 16px",background:selectedScenes.size>0?SURF:"transparent",border:"none",borderRadius:"12px",
                    color:selectedScenes.size>0?T2:"transparent",fontSize:"11px",cursor:selectedScenes.size>0?"pointer":"default",fontFamily:"inherit",
                    pointerEvents:selectedScenes.size>0?"auto":"none",
                    WebkitAppearance:"none",
                  }}>✕</button>
                </div>
              
              {scenes.map((s,idx)=>(
                <div key={s.id}>
                  {(mode==="play"||mode==="short"||mode==="media") && s.kind==="act" ? (
                    <div onClick={()=>{
                      if (_dragSceneId.current || _dragJustEnded.current) return;
                      if (mode==="media"||mode==="short") { toggleSceneSelect(s.id); return; }
                      if (selectedScenes.size > 0) { toggleActSelect(s.actNum); return; }
                      setMobileTab("editor");setActiveSceneId(s.id);setTimeout(()=>{const el=sceneRefs.current[s.id];if(el&&scrollRef.current)scrollRef.current.scrollTo({top:el.offsetTop-60,behavior:"smooth"});},80);
                    }}
                      style={{
                        padding:"12px 14px",borderRadius:"14px",cursor:"pointer",marginBottom:"6px",
                        marginTop:idx>0?"6px":"0",
                        background:activeSceneId===s.id?BG:SURF,
                        boxShadow:activeSceneId===s.id?SH_IN:"none",
                        borderLeft:`3px solid ${(mode==="media"||mode==="short")?selectedScenes.has(s.id)?mc:"transparent":activeSceneId===s.id?mc:"transparent"}`,
                      }}>
                      <div style={{display:"flex",alignItems:"center",width:"100%"}}>
                        {(mode==="film"||mode==="play"||mode==="media"||mode==="short") && (
                          <div onClick={e=>{if(_dragSceneId.current||_dragJustEnded.current)return;e.stopPropagation();(mode==="media"||mode==="short")?toggleSceneSelect(s.id):toggleActSelect(s.actNum);}} style={{pointerEvents:_dragSceneId.current?"none":"auto",
                            width:"18px",height:"18px",borderRadius:"5px",flexShrink:0,cursor:"pointer",
                            border:`2px solid ${selectedScenes.has(s.id)?mc:T3+"66"}`,
                            background:selectedScenes.has(s.id)?mc:"transparent",
                            display:"flex",alignItems:"center",justifyContent:"center",
                          }}>{selectedScenes.has(s.id)&&<span style={{color:"#000",fontSize:"11px",fontWeight:"bold"}}>✓</span>}</div>
                        )}
                        <span style={{color:mc,fontSize:"11px",minWidth:"20px"}}>{s.actNum}.</span>
                        <span style={{color:T1,fontSize:"13px",lineHeight:"1.4"}}>{s.text||(mode==="media"?"БЛОК":mode==="short"?"ВИДЕО":"АКТ")}</span>
                      </div>
                    </div>
                  ) : (<>
                  {/* Индикатор вставки перед сценой */}
                  <div style={{
                    height: dragSceneId && dragOverId===s.id ? "4px" : "0px",
                    borderRadius:"2px",
                    background: mc,
                    boxShadow: `0 0 8px ${mc}`,
                    marginBottom: dragSceneId && dragOverId===s.id ? "8px" : "0px",
                    flexShrink:0,
                  }}/>
                  <div
                    ref={el=>sceneCardRefs.current[s.id]=el}
                    data-scene-id={s.id}
                    onTouchStart={e=>{
                      const touch = e.touches[0];
                      dragStartY.current = touch.clientY;
                      dragLongPress.current = setTimeout(()=>{
                        const card = sceneCardRefs.current[s.id];
                        setDragCardH(card ? card.offsetHeight : 80);
                        setDragPos({x: touch.clientX, y: touch.clientY});
                        _setDragSceneId.current(s.id);
                      }, 400);
                    }}
                    onTouchMove={e=>{
                      if (Math.abs(e.touches[0].clientY - dragStartY.current) > 8) {
                        clearTimeout(dragLongPress.current);
                      }
                      if (!_dragSceneId.current) return;
                      e.preventDefault();
                      const touch = e.touches[0];
                      setDragPos({x: touch.clientX, y: touch.clientY});
                      // Find card under touch using bounding rects in scenes order
                      let foundId = null;
                      for (const sc of scenes) {
                        if (sc.kind === "act") continue;
                        const el = sceneCardRefs.current[sc.id];
                        if (!el) continue;
                        const r = el.getBoundingClientRect();
                        if (touch.clientY >= r.top && touch.clientY <= r.bottom) { foundId = sc.id; break; }
                      }
                      if (foundId && foundId !== _dragSceneId.current) _setDragOverId.current(foundId);
                      else if (!foundId) _setDragOverId.current(null);
                    }}
                    onTouchEnd={()=>{
                      clearTimeout(dragLongPress.current);
                      if (_dragSceneId.current && _dragOverId.current && _dragSceneId.current!==_dragOverId.current) {
                        moveScene(_dragSceneId.current, _dragOverId.current);
                        _dragJustEnded.current = true;
                        setTimeout(()=>{ _dragJustEnded.current = false; }, 300);
                      }
                      _setDragSceneId.current(null);
                      _setDragOverId.current(null);
                    }}
                    onMouseDown={e=>{
                      if (e.button !== 0) return;
                      dragStartY.current = e.clientY;
                      const startX = e.clientX;
                      let dragging = false;
                      const card = sceneCardRefs.current[s.id];
                      const onMove = (ev) => {
                        if (!dragging) {
                          if (Math.abs(ev.clientY - dragStartY.current) < 5) return;
                          dragging = true;
                          setDragCardH(card ? card.offsetHeight : 80);
                          setDragPos({x: ev.clientX, y: ev.clientY});
                          _setDragSceneId.current(s.id);
                        }
                        if (!_dragSceneId.current) return;
                        setDragPos({x: ev.clientX, y: ev.clientY});
                        let foundId = null;
                        for (const sc of scenes) {
                          if (sc.kind === "act") continue;
                          const el = sceneCardRefs.current[sc.id];
                          if (!el) continue;
                          const r = el.getBoundingClientRect();
                          if (ev.clientY >= r.top && ev.clientY <= r.bottom) { foundId = sc.id; break; }
                        }
                        if (foundId && foundId !== _dragSceneId.current) _setDragOverId.current(foundId);
                        else if (!foundId) _setDragOverId.current(null);
                      };
                      const onUp = () => {
                        if (_dragSceneId.current && _dragOverId.current && _dragSceneId.current !== _dragOverId.current) {
                          moveScene(_dragSceneId.current, _dragOverId.current);
                          _dragJustEnded.current = true;
                          setTimeout(()=>{ _dragJustEnded.current = false; }, 300);
                        }
                        _setDragSceneId.current(null);
                        _setDragOverId.current(null);
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                      };
                      document.addEventListener('mousemove', onMove);
                      document.addEventListener('mouseup', onUp);
                    }}
                    onClick={()=>{
                      if (_dragSceneId.current || _dragJustEnded.current) return;
                      if (mode==="media" || mode==="short") { toggleSceneSelect(s.id); return; }
                      if (selectedScenes.size > 0) { toggleSceneSelect(s.id); return; }
                      setMobileTab("editor");
                      setActiveSceneId(s.id);
                      setTimeout(()=>{
                        const el = sceneRefs.current[s.id];
                        if (el && scrollRef.current)
                          scrollRef.current.scrollTo({top: el.offsetTop - 60, behavior:"smooth"});
                      }, 80);
                    }} style={{
                      padding:"12px 14px",borderRadius:"14px",cursor:"pointer",marginBottom:"6px",
                      background:SURF,
                      boxShadow:"none",
                      borderLeft:`3px solid ${selectedScenes.has(s.id)?mc:"transparent"}`,
                      opacity: dragSceneId===s.id ? 0 : 1,
                      userSelect:"none", WebkitUserSelect:"none",
                      WebkitTapHighlightColor:"transparent",
                      transform:"translateZ(0)",
                      willChange:"opacity",
                    }}>
                    <div style={{display:"flex",alignItems:"center"}}>
                      {(mode==="film"||mode==="play"||mode==="media"||mode==="short") && (
                        <div onClick={e=>{if(_dragSceneId.current||_dragJustEnded.current)return;e.stopPropagation();toggleSceneSelect(s.id);}} style={{
                          width:"18px",height:"18px",borderRadius:"5px",flexShrink:0,cursor:"pointer",
                          pointerEvents:_dragSceneId.current?"none":"auto",
                          border:`2px solid ${selectedScenes.has(s.id)?mc:T3+"66"}`,
                          background:selectedScenes.has(s.id)?mc:"transparent",
                          display:"flex",alignItems:"center",justifyContent:"center",
                        }}>{selectedScenes.has(s.id)&&<span style={{color:"#000",fontSize:"11px",fontWeight:"bold"}}>✓</span>}</div>
                      )}
                      <span style={{color:mc,fontSize:"11px",minWidth:"20px"}}>{(mode==="play"||mode==="short"||mode==="media") && s.actNum ? `${s.actNum}.${s.subNum}` : `${s.num}.`}</span>
                      <span style={{color:T1,fontSize:"13px",lineHeight:"1.4"}}>{s.text||"—"}</span>
                      <span style={{marginLeft:"auto",color:T3,fontSize:"16px",opacity:0.35,paddingLeft:"8px"}}>⠿</span>
                    </div>
                    {s.cast && <div style={{color:T2,fontSize:"11px",paddingLeft:"28px",marginTop:"4px"}}>{s.cast}</div>}
                    <div style={{display:"flex",justifyContent:"flex-end",marginTop:"6px"}}>
                      <button onMouseDown={e=>{e.stopPropagation();e.preventDefault();}} onClick={e=>{e.stopPropagation();dupScene(s.id);}} style={{
                        background:`${mc}11`,border:`1px solid ${mc}33`,
                        borderRadius:"6px",color:mc,fontSize:"13px",lineHeight:1,
                        cursor:"pointer",padding:"3px 7px",
                      }}>⧉</button>
                      <button onMouseDown={e=>{e.stopPropagation();e.preventDefault();}} onClick={e=>{e.stopPropagation();delScene(s.id);}} style={{
                        background:"#f8717108",border:"1px solid #f8717118",
                        borderRadius:"6px",lineHeight:1,marginLeft:"4px",
                        cursor:"pointer",padding:"3px 7px",
                        display:"flex",alignItems:"center",justifyContent:"center",
                      }}><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="1" x2="7" y2="7"/><line x1="7" y1="1" x2="1" y2="7"/></svg></button>
                    </div>
                  </div>
                </>)}
                </div>
              ))}
              {/* Призрак — следует за пальцем */}
              {dragSceneId && (()=>{
                const s = scenes.find(x=>x.id===dragSceneId);
                if (!s) return null;
                return (
                  <div style={{
                    position:"fixed",
                    left: 16,
                    top: dragPos.y - dragCardH/2,
                    width: "calc(100vw - 56px)",
                    zIndex:999,
                    pointerEvents:"none",
                    padding:"12px 14px",borderRadius:"14px",
                    background:SURF,
                    boxShadow:`0 12px 40px rgba(0,0,0,0.45), 0 0 0 1.5px ${mc}66`,
                    opacity:0.92,
                    userSelect:"none",
                    transform:"scale(1.02)",
                  }}>
                    <div style={{display:"flex",alignItems:"center"}}>
                      {(mode==="film"||mode==="play"||mode==="media"||mode==="short") && (
                        <div onClick={e=>{if(_dragSceneId.current||_dragJustEnded.current)return;e.stopPropagation();toggleSceneSelect(s.id);}} style={{
                          width:"18px",height:"18px",borderRadius:"5px",flexShrink:0,cursor:"pointer",
                          pointerEvents:_dragSceneId.current?"none":"auto",
                          border:`2px solid ${selectedScenes.has(s.id)?mc:T3+"66"}`,
                          background:selectedScenes.has(s.id)?mc:"transparent",
                          display:"flex",alignItems:"center",justifyContent:"center",
                        }}>{selectedScenes.has(s.id)&&<span style={{color:"#000",fontSize:"11px",fontWeight:"bold"}}>✓</span>}</div>
                      )}
                      <span style={{color:mc,fontSize:"11px",minWidth:"20px"}}>{(mode==="play"||mode==="short"||mode==="media") && s.actNum ? `${s.actNum}.${s.subNum}` : `${s.num}.`}</span>
                      <span style={{color:T1,fontSize:"13px",lineHeight:"1.4"}}>{s.text||"—"}</span>
                    </div>
                    {s.cast && <div style={{color:T2,fontSize:"11px",paddingLeft:"28px",marginTop:"4px"}}>{s.cast}</div>}
                  </div>
                );
              })()}
              <div style={{display:"flex",marginTop:"8px"}}>
                <button onMouseDown={e=>e.preventDefault()}
                  onClick={()=>{const last=blocksRef.current[blocksRef.current.length-1];if(!last)return; if(mode==="media"){addAfter(last.id,"segment");}else if(mode==="short"){addAfter(last.id,"video");}else{addAfter(last.id,"scene");}}} style={{
                  flex:1,padding:"14px",background:BG,boxShadow:SH_SM,
                  border:"none",borderRadius:"14px",color:T2,fontSize:"11px",cursor:"pointer",fontFamily:"inherit",letterSpacing:"2px",
                }}>{mode==="media" ? "+ БЛОК" : mode==="short" ? "+ ВИДЕО" : "+ СЦЕНА"}</button>
                {mode==="play" && (
                  <button onMouseDown={e=>e.preventDefault()}
                    onClick={()=>{const last=blocks[blocks.length-1];if(last)addAfter(last.id,"act");}} style={{
                    flex:1,padding:"14px",background:BG,boxShadow:SH_SM,
                    border:"none",borderRadius:"14px",color:T2,fontSize:"11px",cursor:"pointer",fontFamily:"inherit",letterSpacing:"2px",
                  }}>+ АКТ</button>
                )}

              </div>
            </div>
          )}

          {/* EDITOR */}
          {mobileTab==="editor" && mode==="note" && (
            <div style={{height:"100%",display:"flex",flexDirection:"column",padding:"12px 16px"}}>
              {isGuest && (
                <button onMouseDown={e=>e.preventDefault()} onClick={()=>{ try{localStorage.setItem("ow_note_draft",noteText);}catch(e){} onLogin&&onLogin(); }}
                  style={{
                    alignSelf:"flex-end",marginBottom:"8px",
                    padding:"6px 16px",background:mc+"22",border:`1px solid ${mc}66`,
                    borderRadius:"20px",color:mc,fontSize:"11px",letterSpacing:"1px",
                    cursor:"pointer",fontFamily:"inherit",
                  }}>ВОЙТИ →</button>
              )}
              {(()=>{
                const noteToolbar = [
                  { cmd:"bold",          icon:"Ж", title:"Жирный",       style:{fontWeight:"bold",fontFamily:"serif"} },
                  { cmd:"italic",        icon:"К", title:"Курсив",       style:{fontStyle:"italic",fontFamily:"serif"} },
                  { cmd:"underline",     icon:"Ч", title:"Подчёркнутый", style:{textDecoration:"underline"} },
                  { cmd:"removeFormat", icon:"Н", title:"Убрать форматирование", isBlock:false, style:{} },
                  { sep:true },
                  { cmd:"insertUnorderedList", icon:"•≡", title:"Список" },
                  { cmd:"insertOrderedList",   icon:"1≡", title:"Нумер. список" },
                  { sep:true },
                  { cmd:"h1", icon:"H1", title:"Заголовок 1", isBlock:true },
                  { cmd:"h2", icon:"H2", title:"Заголовок 2", isBlock:true },
                  { cmd:"formatBlock", arg:"p", icon:"¶", title:"Обычный текст" },
                ];
                const execFmt = (cmd, arg) => { document.execCommand(cmd, false, arg||null); };
                const applyFontSize = (pt) => {
                  const editor = noteEditorRef.current;
                  if (!editor) return;
                  editor.focus();
                  const sel = window.getSelection();
                  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
                  const range = sel.getRangeAt(0);
                  const span = document.createElement("span");
                  span.style.fontSize = pt + "pt";
                  try {
                    range.surroundContents(span);
                  } catch(e) {
                    const frag = range.extractContents();
                    span.appendChild(frag);
                    range.insertNode(span);
                  }
                  const newRange = document.createRange();
                  newRange.selectNodeContents(span);
                  sel.removeAllRanges();
                  sel.addRange(newRange);
                  noteSelRangeRef.current = newRange.cloneRange();
                  const html = editor.innerHTML;
                  noteTextRef.current = html;
                  setNoteText(html);
                  markDirty();
                };
                const FONT_SIZES = [8,10,11,12,13,14,16,18,20,24,28,32,36];
                const NOTE_COLORS = ["#e8e4d8","#f472b6","#60a5fa","#4ade80","#fbbf24","#a78bfa","#f87171","#34d399"];
                const saveNoteSelection = () => {
                  const sel = window.getSelection();
                  if (sel && sel.rangeCount > 0) noteSelRangeRef.current = sel.getRangeAt(0).cloneRange();
                };
                const restoreNoteSelection = () => {
                  const sel = window.getSelection();
                  if (!sel) return false;
                  sel.removeAllRanges();
                  if (noteSelRangeRef.current) {
                    sel.addRange(noteSelRangeRef.current);
                    return true;
                  }
                  return false;
                };
                const applyNoteColor = (color) => {
                  const editor = noteEditorRef.current;
                  if (!editor) return;
                  editor.focus();
                  restoreNoteSelection();
                  execFmt("foreColor", color);
                  const html = editor.innerHTML;
                  noteTextRef.current = html;
                  setNoteText(html);
                  markDirty();
                  scheduleNoteHistorySnapshot(html);
                  setNoteColorOpen(false);
                };
                const alignSVG = {
                  left:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>,
                  center: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>,
                  right:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>,
                };
                const btnSt = {
                  width:"26px", height:"26px", borderRadius:"6px",
                  background:"transparent", border:`1px solid ${T3}33`,
                  color:T2, fontSize:"11px", cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  marginRight:"3px", WebkitAppearance:"none", flexShrink:0,
                };
                return (
                  <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
                    {/* Toolbar */}
                    <div style={{
                      display:"flex", alignItems:"center", flexWrap:"wrap",
                      padding:"6px 0 8px", marginBottom:"8px",
                      borderBottom:`1px solid ${T3}22`,
                    }}>
                      {noteToolbar.slice(0,4).map((t,i)=> t.sep
                        ? <div key={i} style={{width:"1px",height:"16px",background:T3+"33",marginRight:"6px",marginBottom:"3px"}}/>
                        : <button key={i}
                            title={t.title}
                            onMouseDown={e=>{
                              e.preventDefault();
                              const editor = noteEditorRef.current;
                              if (!editor) return;
                              editor.focus();
                              restoreNoteSelection();
                              if(t.isBlock){
                                const cur = String(document.queryCommandValue("formatBlock") || "").toLowerCase();
                                execFmt("formatBlock", cur===t.cmd.toLowerCase()?"p":t.cmd);
                              } else {
                                execFmt(t.cmd, t.arg);
                              }
                              const html = editor.innerHTML;
                              noteTextRef.current = html;
                              setNoteText(html);
                              markDirty();
                              scheduleNoteHistorySnapshot(html);
                              saveNoteSelection();
                            }}
                            style={{...btnSt, ...(t.style||{}), fontSize:typeof t.icon==="string"&&t.icon.length>1?"9px":"11px", marginBottom:"3px"}}>
                            {t.icon}
                          </button>
                      )}
                      <div style={{position:"relative",marginRight:"3px",marginBottom:"3px"}}>
                        <button
                          title="Цвет текста"
                          onMouseDown={e=>{e.preventDefault(); e.stopPropagation(); saveNoteSelection(); setNoteColorOpen(v=>!v);}}
                          style={{
                            width:"26px",height:"26px",borderRadius:"6px",
                            border:`1px solid ${T3}33`,background:"transparent",cursor:"pointer",
                            padding:"0",display:"flex",alignItems:"center",justifyContent:"center",
                            WebkitAppearance:"none",
                          }}>
                          <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"#a9a6c9",boxShadow:"0 0 0 1px rgba(255,255,255,0.08) inset"}}/>
                        </button>
                        {noteColorOpen && (
                          <div style={{position:"absolute",bottom:"32px",left:0,background:SURF,borderRadius:"12px",
                            boxShadow:"0 8px 24px rgba(0,0,0,0.5)",padding:"8px",zIndex:100,
                            display:"flex",flexWrap:"wrap",width:"104px"}}>
                            {NOTE_COLORS.map(c=>(
                              <button key={c}
                                onMouseDown={e=>{e.preventDefault(); e.stopPropagation(); applyNoteColor(c);}}
                                style={{width:"20px",height:"20px",borderRadius:"50%",background:c,
                                  border:"2px solid transparent",cursor:"pointer",marginRight:"4px",marginBottom:"4px",
                                  WebkitAppearance:"none"}}/>
                            ))}
                            <button
                              onMouseDown={e=>{e.preventDefault(); e.stopPropagation(); setNoteColorOpen(false);}}
                              title="Закрыть"
                              style={{width:"20px",height:"20px",borderRadius:"50%",background:"transparent",
                                border:"1px dashed "+T3,cursor:"pointer",fontSize:"10px",color:T3,
                                display:"flex",alignItems:"center",justifyContent:"center",WebkitAppearance:"none"}}>
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke={T3} strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="1" x2="7" y2="7"/><line x1="7" y1="1" x2="1" y2="7"/></svg>
                            </button>
                          </div>
                        )}
                      </div>
                      {noteToolbar.slice(4).map((t,i)=> t.sep
                        ? <div key={`tail-${i}`} style={{width:"1px",height:"16px",background:T3+"33",marginRight:"6px",marginBottom:"3px"}}/>
                        : <button key={`tail-${i}`}
                            title={t.title}
                            onMouseDown={e=>{
                              e.preventDefault();
                              const editor = noteEditorRef.current;
                              if (!editor) return;
                              editor.focus();
                              restoreNoteSelection();
                              if(t.isBlock){
                                const cur = String(document.queryCommandValue("formatBlock") || "").toLowerCase();
                                execFmt("formatBlock", cur===t.cmd.toLowerCase()?"p":t.cmd);
                              } else {
                                execFmt(t.cmd, t.arg);
                              }
                              const html = editor.innerHTML;
                              noteTextRef.current = html;
                              setNoteText(html);
                              markDirty();
                              scheduleNoteHistorySnapshot(html);
                              saveNoteSelection();
                            }}
                            style={{...btnSt, ...(t.style||{}), fontSize:typeof t.icon==="string"&&t.icon.length>1?"9px":"11px", marginBottom:"3px"}}>
                            {t.icon}
                          </button>
                      )}
                      {/* Divider */}
                      <div style={{width:"1px",height:"16px",background:T3+"33",marginRight:"6px",marginBottom:"3px"}}/>
                      {/* Выравнивание — 1 кнопка + дропдаун */}
                      <div style={{position:"relative",marginRight:"3px",marginBottom:"3px"}}>
                        <button title="Выравнивание"
                          onMouseDown={e=>{e.preventDefault(); setNoteAlignOpen(o=>!o);}}
                          style={{...btnSt, border:`1px solid ${noteAlignOpen ? mc : T3+"33"}`, background:noteAlignOpen?`${mc}22`:"transparent", color:noteAlignOpen?mc:T2}}>
                          {alignSVG[noteAlign]}
                        </button>
                        {noteAlignOpen && (
                          <div style={{position:"absolute",top:"30px",left:0,background:SURF,
                            borderRadius:"8px",boxShadow:"0 8px 24px rgba(0,0,0,0.45)",
                            padding:"4px",zIndex:50,minWidth:"150px"}}>
                            {[
                              {cmd:"justifyLeft",   align:"left",   label:"По левому краю"},
                              {cmd:"justifyCenter", align:"center", label:"По центру"},
                              {cmd:"justifyRight",  align:"right",  label:"По правому краю"},
                            ].map(a=>(
                              <button key={a.align}
                                onMouseDown={e=>{
                                e.preventDefault();
                                const editor = noteEditorRef.current;
                                if (!editor) return;
                                editor.focus();
                                restoreNoteSelection();
                                execFmt(a.cmd);
                                const html = editor.innerHTML;
                                noteTextRef.current = html;
                                setNoteText(html);
                                markDirty();
                                scheduleNoteHistorySnapshot(html);
                                saveNoteSelection();
                                setNoteAlign(a.align);
                                setNoteAlignOpen(false);
                              }}
                                style={{display:"flex",alignItems:"center",width:"100%",
                                  padding:"7px 10px",background:noteAlign===a.align?`${mc}22`:"transparent",
                                  border:"none",borderRadius:"6px",cursor:"pointer",
                                  color:noteAlign===a.align?mc:T2,gap:"8px",WebkitAppearance:"none"}}>
                                {alignSVG[a.align]}
                                <span style={{fontSize:"11px",whiteSpace:"nowrap"}}>{a.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Divider */}
                      <div style={{width:"1px",height:"16px",background:T3+"33",marginRight:"6px",marginBottom:"3px"}}/>
                      {/* Размер шрифта: − [N] + */}
                      <div style={{display:"flex",alignItems:"center",marginRight:"3px",marginBottom:"3px"}}>
                        <button
                          onMouseDown={e=>{e.preventDefault(); const s=Math.max(4,noteFontSize-1); setNoteFontSize(s); applyFontSize(s);}}
                          style={{...btnSt,width:"22px",fontSize:"14px",fontWeight:"300",marginRight:0}}>−</button>
                        <input
                          type="text"
                          key={noteFontSize}
                          defaultValue={noteFontSize}
                          onMouseDown={()=>{const sel=window.getSelection();if(sel&&sel.rangeCount>0)noteSelRangeRef.current=sel.getRangeAt(0).cloneRange();}}
                          onBlur={e=>{const v=parseInt(e.target.value);if(!isNaN(v)&&v>=4&&v<=96){const sel=window.getSelection();sel.removeAllRanges();if(noteSelRangeRef.current)sel.addRange(noteSelRangeRef.current);setNoteFontSize(v);applyFontSize(v);}}}
                          onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();const v=parseInt(e.target.value);if(!isNaN(v)&&v>=4&&v<=96){const sel=window.getSelection();sel.removeAllRanges();if(noteSelRangeRef.current)sel.addRange(noteSelRangeRef.current);setNoteFontSize(v);applyFontSize(v);}e.target.blur();}}}
                          style={{width:"26px",textAlign:"center",background:"transparent",border:`1px solid ${T3}33`,borderRadius:"4px",color:T2,fontSize:"10px",padding:"1px 2px",fontFamily:"inherit",outline:"none"}}
                        />
                        <button
                          onMouseDown={e=>{e.preventDefault(); const s=Math.min(96,noteFontSize+1); setNoteFontSize(s); applyFontSize(s);}}
                          style={{...btnSt,width:"22px",fontSize:"14px",fontWeight:"300",marginRight:"3px"}}>+</button>
                      </div>
                    </div>
                    {/* Editor */}
                    <div
                      key={projectId}
                      ref={noteEditorRef}
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={spellOn}
                      onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); document.execCommand("insertLineBreak"); } }}
                      onInput={e=>{const html=e.currentTarget.innerHTML;noteTextRef.current=html;setNoteText(html);markDirty();scheduleNoteHistorySnapshot(html); saveNoteSelection();}}
                      onFocus={()=>saveNoteSelection()}
                      onKeyUp={()=>saveNoteSelection()}
                      onMouseUp={()=>saveNoteSelection()}
                      data-placeholder="Мысли, идеи, наброски…"
                      style={{
                        flex:1, minHeight:"40vh", outline:"none",
                        color:T1, fontSize:"15px", lineHeight:"1.8",
                        fontFamily:"inherit", overflowY:"auto",
                        boxSizing:"border-box",
                        backgroundImage:`repeating-linear-gradient(to bottom, transparent 0, transparent 1026px, ${T3}44 1026px, ${T3}44 1027px)`,
                        backgroundAttachment:"local",
                      }}
                    />
                    <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:${T3};pointer-events:none;}`}</style>
                  </div>
                );
              })()}
            </div>
          )}

          {mobileTab==="editor" && mode!=="note" && (
            <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
              <div ref={scrollRef} onScroll={onScroll} style={{flex:1,overflow:"auto"}}>
                <div style={{minWidth: zoom > 100 ? `${zoom}%` : undefined}}>
                <div style={{
                  padding:"24px 18px 20px",
                  transform: zoom!==100?`scale(${zoom/100})`:undefined,
                  transformOrigin:"top left",
                  WebkitTransform: zoom!==100?`scale(${zoom/100})`:undefined,
                  WebkitTransformOrigin:"top left",
                  transition:"transform .15s",
                }}>
                  {mode==="play" && (
                    <PlayHeaderEditor
                      items={playHeader} setItems={setPlayHeader}
                      focKey={playHeaderFoc} setFocKey={setPlayHeaderFoc}
                      T1={T1} T2={T2} T3={T3} SURF={SURF} BG={BG} mc={mc} SH_SM={SH_SM} docFont={docFont}
                    />
                  )}
                  {mode==="media" && (
                    <PlayHeaderEditor
                      items={mediaHeader} setItems={setMediaHeader}
                      focKey={mediaHeaderFoc} setFocKey={setMediaHeaderFoc}
                      T1={T1} T2={T2} T3={T3} SURF={SURF} BG={BG} mc={mc} SH_SM={SH_SM} docFont="Arial"
                    />
                  )}
                  {mode==="short" && (
                    <div>
                      <div style={{display:"flex",alignItems:"center",marginBottom:"12px"}}>
                        <div onClick={()=>document.getElementById("logo-upload").click()} style={{
                          width:"56px",height:"56px",borderRadius:"12px",background:SURF,
                          boxShadow:SH_SM,cursor:"pointer",overflow:"hidden",flexShrink:0,
                          display:"flex",alignItems:"center",justifyContent:"center",border:`1px dashed ${T3}55`,
                        }}>
                          {contentLogo
                            ? <img src={contentLogo} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                            : <span style={{color:T3,fontSize:"20px"}}>+</span>
                          }
                        </div>
                        <div>
                          <div style={{color:T2,fontSize:"11px",letterSpacing:"1px"}}>ЛОГОТИП</div>
                          <div style={{color:T3,fontSize:"10px"}}>56×56 · квадратный</div>
                          {contentLogo && <button onClick={()=>setContentLogo(null)} style={{background:"transparent",border:"none",color:"#f472b6",fontSize:"10px",cursor:"pointer",padding:"0",marginTop:"2px"}}>удалить</button>}
                        </div>
                        <input id="logo-upload" type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
                          const file=e.target.files[0]; if(!file) return;
                          const r=new FileReader(); r.onload=ev=>setContentLogo(ev.target.result); r.readAsDataURL(file);
                        }}/>
                      </div>
                      <PlayHeaderEditor
                        items={contentHeader} setItems={setContentHeader}
                        focKey={contentHeaderFoc} setFocKey={setContentHeaderFoc}
                        T1={T1} T2={T2} T3={T3} SURF={SURF} BG={BG} mc={mc} SH_SM={SH_SM} docFont="Arial"
                      />
                    </div>
                  )}
                  {blocks.map(block=>renderBlock(block,true))}
                  <div style={{height:"20px"}}/>
                </div>
                </div>
              </div>
              {mode!=="note" && renderMobileToolbar()}
            </div>
          )}

          {/* AI */}
          {mobileTab==="ai" && (
            <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"10px 12px",display:"flex",flexShrink:0}}>
                {AIM.map(m=>(
                  <button key={m.id} onClick={()=>setAiMod(m.id)} style={{
                    flex:1,padding:"8px 6px",background:aiMod===m.id?BG:SURF,
                    boxShadow:aiMod===m.id?SH_IN:SH_SM,border:"none",borderRadius:"12px",
                    cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",
                  }}>
                    <div style={{width:"7px",height:"7px",borderRadius:"50%",background:m.color,boxShadow:aiMod===m.id?`0 0 8px ${m.color}`:"none",opacity:aiMod===m.id?1:0.3}}/>
                    <span style={{color:aiMod===m.id?T1:T2,fontSize:"10px"}}>{m.label}</span>
                  </button>
                ))}
              </div>
              <div style={{flex:1,overflow:"auto",padding:"8px 12px",display:"flex",flexDirection:"column"}}>
                {msgs.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                    <div style={{maxWidth:"85%",padding:"10px 14px",background:m.role==="user"?BG:SURF,boxShadow:SH_SM,
                      borderRadius:m.role==="user"?"14px 14px 2px 14px":"14px 14px 14px 2px",
                      borderLeft:m.role==="ai"?`2px solid ${AIM.find(x=>x.id===m.model)?.color||T3}`:"none",
                      fontSize:"13px",lineHeight:"1.7",color:m.role==="user"?T2:T1}}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {aiLoad && <div style={{display:"flex",alignItems:"center"}}><Whale size={20}/><span style={{color:T3,fontSize:"11px"}}>ДУМАЕТ...</span></div>}
                <div ref={msgEnd}/>
              </div>
              <div style={{padding:"10px 12px",flexShrink:0}}>
                <div style={{display:"flex",alignItems:"center",background:BG,boxShadow:SH_IN,borderRadius:"14px",padding:"10px 14px"}}>
                  <input value={aiIn} onChange={e=>setAiIn(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();send();}}}
                    placeholder={`${AIM.find(m=>m.id===aiMod)?.label}...`}
                    style={{flex:1,background:"transparent",border:"none",outline:"none",color:T1,fontSize:"13px",fontFamily:"inherit"}}
                  />
                  <button onClick={send} style={{padding:"6px 12px",background:SURF,boxShadow:SH_SM,border:"none",borderRadius:"10px",color:mc,fontSize:"16px",cursor:"pointer"}}>→</button>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
    );
  }
  // ══════════════════════════════════════════════
  // DESKTOP LAYOUT
  // ══════════════════════════════════════════════
  // ─── DESKTOP LAYOUT ───────────────────────────

  return (
    <div style={{
      display:"flex", height:"100vh",
      background: BG,
      fontFamily:"'Courier New',monospace",
      color: T1, overflow:"hidden",
      position:"relative",
    }}>

      {/* ══ DESKTOP: menuOpen ══ */}

      {/* ══ DESKTOP: projectsOpen ══ */}
      {projectsOpen && (
        <div style={{position:"fixed",inset:0,zIndex:300,display:"flex"}}>
          <div onClick={()=>setProjectsOpen(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}}/>
          <div style={{
            position:"relative",width:"320px",background:SURF,height:"100%",
            boxShadow:"4px 0 24px rgba(0,0,0,0.5)",display:"flex",flexDirection:"column",
            zIndex:1,overflowY:"auto",
          }}>
            <div style={{padding:"20px 20px 16px",display:"flex",alignItems:"center",borderBottom:`1px solid ${T3}22`}}>
              <span style={{color:T1,fontSize:"11px",letterSpacing:"3px",flex:1}}>МОИ ПРОЕКТЫ</span>
              <button onClick={()=>setProjectsOpen(false)} style={{
                background:BG, border:"none", color:T2, fontSize:"18px",
                cursor:"pointer", padding:"4px 8px", lineHeight:1,
                borderRadius:"8px", boxShadow:SH_SM, WebkitAppearance:"none",
              }}>✕</button>
            </div>
            <div style={{flex:1,overflow:"auto",padding:"12px"}}>
              {projectsList.length===0 && (
                <div style={{color:T3,fontSize:"13px",textAlign:"center",paddingTop:"40px",letterSpacing:"1px"}}>Нет сохранённых проектов</div>
              )}
              {projectsList.map(p=>(
                <div key={p.id} style={{
                  padding:"14px 16px",borderRadius:"14px",marginBottom:"8px",
                  background:p.id===projectId?BG:SURF,
                  boxShadow:p.id===projectId?SH_IN:SH_SM,
                  borderLeft:`3px solid ${p.id===projectId?mc:"transparent"}`,
                  display:"flex",alignItems:"center",
                }}>
                  <div style={{flex:1,cursor:"pointer"}} onClick={()=>{
                    try {
                      const data = JSON.parse(localStorage.getItem("ow_proj_"+p.id)||"null");
                      if (data) { loadProject(data); setProjectsOpen(false); }
                    } catch(e) {}
                  }}>
                    <div style={{color:T1,fontSize:"13px",marginBottom:"3px"}}>{p.name||"Без названия"}</div>
                    <div style={{color:T3,fontSize:"10px"}}>{p.mode||"film"} · {new Date(p.ts||0).toLocaleDateString("ru")}</div>
                  </div>
                  <button onClick={()=>deleteProject(p.id)} style={{
                    background:"transparent",border:"none",color:T3,fontSize:"16px",
                    cursor:"pointer",padding:"4px 8px",lineHeight:1,
                  }}><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="1" x2="7" y2="7"/><line x1="7" y1="1" x2="1" y2="7"/></svg></button>
                </div>
              ))}
            </div>
            <div style={{padding:"12px"}}>
              <button onClick={()=>{newProject();setProjectsOpen(false);}} style={{
                width:"100%",padding:"12px",background:BG,boxShadow:SH_SM,
                border:"none",borderRadius:"12px",color:mc,fontSize:"10px",
                cursor:"pointer",fontFamily:"inherit",letterSpacing:"2px",
                WebkitAppearance:"none",
              }}>+ НОВЫЙ ПРОЕКТ</button>
            </div>
          </div>
        </div>
      )}
      {menuOpen && (
        <div style={{
          position:"fixed",inset:0,zIndex:200,
          display:"flex",
        }}>
          <div onClick={()=>setMenuOpen(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}}/>
          <div style={{
            position:"relative",width:"260px",background:SURF,height:"100%",
            boxShadow:"4px 0 24px rgba(0,0,0,0.5)",display:"flex",flexDirection:"column",
            padding:"0",zIndex:1,overflowY:"auto",
          }}>
            {/* Лого */}
            <div style={{padding:"16px 14px 12px",display:"flex",alignItems:"center",borderBottom:`1px solid ${T3}22`}}>
              <div style={{
                width:"36px", height:"36px", borderRadius:"10px",
                background: BG, boxShadow: SH_SM,
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
              }}>
                <Whale size={22}/>
              </div>
              <div style={{flex:1}}>
                <div style={{color:T1, fontSize:"12px", letterSpacing:"3px"}}>OLD WHALE</div>
                <div style={{color:T3, fontSize:"9px", letterSpacing:"2px"}}>РЕДАКТОР</div>
              </div>
              <button onClick={()=>setMenuOpen(false)} style={{
                width:"28px",height:"28px",borderRadius:"8px",background:BG,boxShadow:SH_SM,
                border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                flexShrink:0,padding:"0",color:T2,fontSize:"18px",lineHeight:1,
              }}>✕</button>
            </div>
            {/* Секция: Проект */}
            <div style={{padding:"12px 0",borderBottom:`1px solid ${T3}22`}}>
              <div style={{padding:"4px 20px 8px",color:T3,fontSize:"9px",letterSpacing:"3px"}}>ПРОЕКТ</div>
              {[
                {label:"Новый проект", action:()=>{newProject();setMenuOpen(false);}, svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>},
                {label:"Сохранить", action: saveNow, svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>},
                {label:"Сохранить как", action: saveAs, svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>},
                {label:"История", action:()=>{openProjectsList();setMenuOpen(false);}, svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>},
              ].map(({label,action,svg})=>(
                <button key={label} onClick={action} style={{
                  display:"flex",alignItems:"center",width:"100%",
                  padding:"11px 20px",background:"transparent",border:"none",
                  color:T1,fontSize:"13px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",
                }}>
                  <span style={{width:"20px",display:"flex",alignItems:"center",justifyContent:"center",color:T2,flexShrink:0}}>{svg}</span>
                  {label}
                </button>
              ))}
            </div>
            {/* Секция: Файлы */}
            <div style={{padding:"12px 0",borderBottom:`1px solid ${T3}22`}}>
              <div style={{padding:"4px 20px 8px",color:T3,fontSize:"9px",letterSpacing:"3px"}}>ФАЙЛЫ</div>
              <input id="whale-import-desk" type="file" accept=".whale,.fdx,application/json,application/xml" capture={false} onChange={importWhale} style={{display:"none"}}/>
              {[
                {label:"Экспорт PDF",  sub:"Титульный лист + сценарий", action:()=>{setTitlePageOpen("pdf");setMenuOpen(false);}, locked:false,
                  svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>},
                {label:"Экспорт DOCX", sub:"Word документ", action:()=>{if(!isGuest){setTitlePageOpen("docx");setMenuOpen(false);}}, locked:isGuest, hidden:mode==="note",
                  svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>},
                {label:"Экспорт FDX",  sub:"Final Draft", action:()=>{if(!isGuest){setTitlePageOpen("fdx");setMenuOpen(false);}}, locked:isGuest, hidden:mode==="note"||mode==="media"||mode==="play"||mode==="short",
                  svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="3"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>},
                {label:"Экспорт TXT",  sub:"Простой текст", action:()=>{if(!isGuest){setTitlePageOpen("txt");setMenuOpen(false);}}, locked:isGuest,
                  svg:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>},
              ].map(({label,sub,action,locked,hidden,svg})=>( hidden ? null :
                <button key={label} onClick={action} style={{
                  display:"flex",alignItems:"flex-start",width:"100%",
                  padding:"11px 20px",background:"transparent",border:"none",
                  color:locked?"#f472b6":T1,fontSize:"13px",cursor:locked?"default":"pointer",fontFamily:"inherit",textAlign:"left",opacity:locked?0.5:1,
                }}>
                  <span style={{width:"20px",display:"flex",alignItems:"center",justifyContent:"center",color:locked?"#f472b6":T2,flexShrink:0,marginRight:"12px",paddingTop:"2px"}}>{svg}</span>
                  <div style={{flex:1}}>
                    <div>{label}</div>
                    <div style={{color:locked?"#f472b6":T3,fontSize:"10px",marginTop:"2px"}}>{locked?"Войдите чтобы использовать":sub}</div>
                  </div>
                </button>
              ))}
              <button onClick={()=>openOpenFilePicker("whale-import-desk")} style={{
                display:"flex",alignItems:"flex-start",width:"100%",
                padding:"11px 20px",background:"transparent",border:"none",
                color:T1,fontSize:"13px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",
              }}>
                <span style={{width:"20px",display:"flex",alignItems:"center",justifyContent:"center",color:T2,flexShrink:0,marginRight:"12px",paddingTop:"2px"}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </span>
                <div><div>Открыть</div><div style={{color:T3,fontSize:"10px",marginTop:"2px"}}>{(mode==="film"?".whale / .fdx / .docx":".whale / .fdx")}</div></div>
              </button>
            </div>
            {/* Секция: Режим */}
            <div style={{padding:"12px 0",borderBottom:`1px solid ${T3}22`}}>
              <div style={{padding:"4px 20px 8px",color:T3,fontSize:"9px",letterSpacing:"3px"}}>РЕЖИМ</div>
              {MODES.map(m=>{
                const locked = isGuest && m.id!=="note";
                return (
                  <button key={m.id} onClick={()=>{if(locked) return; switchMode(m.id);setMenuOpen(false);}} style={{
                    display:"flex",alignItems:"center",width:"100%",
                    padding:"11px 20px",background:mode===m.id?`${mc}18`:"transparent",border:"none",
                    color:locked?"#f472b6":mode===m.id?mc:T1,fontSize:"13px",
                    cursor:locked?"default":"pointer",fontFamily:"inherit",textAlign:"left",opacity:locked?0.5:1,
                  }}>
                    <span style={{fontSize:"16px",width:"20px",display:"flex",alignItems:"center",justifyContent:"center"}}>{m.icon}</span>
                    {m.label}
                    {mode===m.id && <span style={{marginLeft:"auto",color:mc}}>✓</span>}
                  </button>
                );
              })}
            </div>
            {/* Прочее */}
            <div style={{padding:"12px 0",borderTop:`1px solid ${T3}22`,marginTop:"auto"}}>
              <div style={{padding:"4px 20px 8px",color:T3,fontSize:"9px",letterSpacing:"3px"}}>ПРОЧЕЕ</div>
              <button onClick={onLogout} style={{
                display:"flex",alignItems:"center",width:"100%",
                padding:"11px 20px",background:"transparent",border:"none",
                color:T1,fontSize:"13px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",
              }}><span style={{fontSize:"16px",width:"20px",textAlign:"center"}}>⏻</span>На главную</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DESKTOP: titlePageOpen ══ */}
      {titlePageOpen && (
        <div style={{position:"fixed",inset:0,zIndex:300,background:BG,display:"flex",flexDirection:"column"}}>
          <div style={{padding:"16px 20px",display:"flex",alignItems:"center",borderBottom:`1px solid ${T3}22`,flexShrink:0}}>
            <button onClick={()=>{ setNewProjectOverlay(false); setTitlePageOpen(false); }} style={{background:"transparent",border:"none",color:T2,fontSize:"20px",cursor:"pointer",padding:"0",lineHeight:1}}>←</button>
            <span style={{color:T1,fontSize:"11px",letterSpacing:"3px"}}>ТИТУЛЬНЫЙ ЛИСТ</span>
          </div>
          <div style={{flex:1,overflow:"auto",padding:"20px 20px 0"}}>
            <div style={{maxWidth:"420px",margin:"0 auto"}}>
              {mode==="note" ? (
                <div>
                  <div style={{color:T3,fontSize:"9px",letterSpacing:"3px",marginBottom:"12px"}}>ПРЕДПРОСМОТР</div>
                  <div style={{padding:"20px",background:"#fff",borderRadius:"12px",color:"#000",fontFamily:"Arial,sans-serif",fontSize:"13px",lineHeight:"1.8",maxHeight:"60vh",overflow:"auto",wordBreak:"break-word"}}
                    dangerouslySetInnerHTML={{__html: noteTextRef.current || noteText || "<span style='color:#aaa'>Блокнот пуст</span>"}}
                  />
                </div>
              ) : (mode==="short" ? [
                {key:"title",    label:"ТЕМА",        ph:"Название / тема",                   val:contentHeader.find(h=>h.key==="title")?.text||"",    set:v=>setContentHeader(p=>p.map(h=>h.key==="title"?{...h,text:v}:h))},
                {key:"platform", label:"ПЛАТФОРМА",   ph:"YouTube / TikTok / Instagram / ВК", val:contentHeader.find(h=>h.key==="platform")?.text||"", set:v=>setContentHeader(p=>p.map(h=>h.key==="platform"?{...h,text:v}:h))},
                {key:"format",   label:"ФОРМАТ",      ph:"Reels / Shorts / Видео / Stories",  val:contentHeader.find(h=>h.key==="format")?.text||"",   set:v=>setContentHeader(p=>p.map(h=>h.key==="format"?{...h,text:v}:h))},
                {key:"account",  label:"АККАУНТ",     ph:"@ник",                              val:contentHeader.find(h=>h.key==="account")?.text||"",  set:v=>setContentHeader(p=>p.map(h=>h.key==="account"?{...h,text:v}:h))},
                {key:"reach",    label:"ОХВАТ",       ph:"100 000+",                          val:contentHeader.find(h=>h.key==="reach")?.text||"",    set:v=>setContentHeader(p=>p.map(h=>h.key==="reach"?{...h,text:v}:h))},
                {key:"pubdate",  label:"ДАТА ВЫХОДА", ph:"дд.мм.гггг",                        val:contentHeader.find(h=>h.key==="pubdate")?.text||"",  set:v=>setContentHeader(p=>p.map(h=>h.key==="pubdate"?{...h,text:v}:h))},
              ] : mode==="media" ? [
                {key:"show",    label:"ПРОГРАММА",  ph:"Название программы",  val:mediaHeader.find(h=>h.key==="show")?.text||"",    set:v=>setMediaHeader(p=>p.map(h=>h.key==="show"?{...h,text:v}:h))},
                {key:"episode", label:"ВЫПУСК",     ph:"№ выпуска / эпизода", val:mediaHeader.find(h=>h.key==="episode")?.text||"", set:v=>setMediaHeader(p=>p.map(h=>h.key==="episode"?{...h,text:v}:h))},
                {key:"date",    label:"ДАТА ЭФИРА", ph:"дд.мм.гггг",          val:mediaHeader.find(h=>h.key==="date")?.text||"",    set:v=>setMediaHeader(p=>p.map(h=>h.key==="date"?{...h,text:v}:h))},
                {key:"channel", label:"КАНАЛ",      ph:"Название канала",     val:mediaHeader.find(h=>h.key==="channel")?.text||"", set:v=>setMediaHeader(p=>p.map(h=>h.key==="channel"?{...h,text:v}:h))},
                {key:"host",    label:"ВЕДУЩИЙ",    ph:"Имя Фамилия",         val:mediaHeader.find(h=>h.key==="host")?.text||"",    set:v=>setMediaHeader(p=>p.map(h=>h.key==="host"?{...h,text:v}:h))},
              ] : mode==="play" ? [
                {key:"title",  label:"НАЗВАНИЕ",  ph:"Название",    val:playHeader.find(h=>h.key==="title")?.text||"",  set:v=>setPlayHeader(p=>p.map(h=>h.key==="title"?{...h,text:v}:h))},
                {key:"genre",  label:"ЖАНР",      ph:"Жанр",        val:playHeader.find(h=>h.key==="genre")?.text||"",  set:v=>setPlayHeader(p=>p.map(h=>h.key==="genre"?{...h,text:v}:h))},
                {key:"author", label:"АВТОР",     ph:"Имя Фамилия", val:playHeader.find(h=>h.key==="author")?.text||"", set:v=>setPlayHeader(p=>p.map(h=>h.key==="author"?{...h,text:v}:h))},
                {key:"remark", label:"ПРИМЕЧАНИЕ",ph:"Ремарка",     val:playHeader.find(h=>h.key==="remark")?.text||"", set:v=>setPlayHeader(p=>p.map(h=>h.key==="remark"?{...h,text:v}:h))},
              ] : isGuest ? [
                {key:"title",  label:"НАЗВАНИЕ", ph:"Название",    val:titlePage.title,  set:v=>setTitlePage(p=>({...p,title:v}))},
                {key:"author", label:"ИНИЦИАЛЫ", ph:"И. Фамилия",  val:titlePage.author, set:v=>setTitlePage(p=>({...p,author:v}))},
              ] : [
                {key:"title",  label:"НАЗВАНИЕ", ph:"Название сценария",   val:titlePage.title,  set:v=>setTitlePage(p=>({...p,title:v}))},
                {key:"genre",  label:"ЖАНР",     ph:"драма, фантастика...",val:titlePage.genre,  set:v=>setTitlePage(p=>({...p,genre:v}))},
                {key:"author", label:"АВТОР",    ph:"Имя Фамилия",         val:titlePage.author, set:v=>setTitlePage(p=>({...p,author:v}))},
                {key:"phone",  label:"ТЕЛЕФОН",  ph:"+7 000 000 00 00",    val:titlePage.phone,  set:v=>setTitlePage(p=>({...p,phone:v}))},
                {key:"email",  label:"EMAIL",    ph:"email@example.com",   val:titlePage.email,  set:v=>setTitlePage(p=>({...p,email:v}))},
                {key:"year",   label:"ГОД",      ph:new Date().getFullYear()+"", val:titlePage.year, set:v=>setTitlePage(p=>({...p,year:v}))},
              ]).map(({key,label,ph,val,set})=>(
                <div key={key} style={{marginBottom:"16px"}}>
                  <div style={{color:T3,fontSize:"9px",letterSpacing:"3px",marginBottom:"6px"}}>{label}</div>
                  <input value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{
                    width:"100%",background:SURF,border:`1px solid ${T3}33`,borderRadius:"10px",
                    padding:"12px 14px",color:T1,fontSize:"14px",fontFamily:"inherit",
                    outline:"none",boxSizing:"border-box",
                  }}/>
                </div>
              ))}
              {/* ── Инлайн-предпросмотр титула ── */}
              {mode!=="note" && (mode==="short" ? (
                <div style={{marginTop:"16px",padding:"16px",background:"#fff",borderRadius:"12px",color:"#000",fontFamily:"Arial,sans-serif",fontSize:"11px",lineHeight:"1.8"}}>
                  <div style={{display:"flex",alignItems:"flex-start",marginBottom:"8px"}}>
                    {contentLogo && <img src={contentLogo} style={{width:"40px",height:"40px",borderRadius:"6px",objectFit:"cover",flexShrink:0,marginRight:"10px"}}/>}
                    <div>{contentHeader.filter(h=>h.type!=="spacer").map(h=>(
                      <div key={h.key} style={{fontWeight:h.bold?"bold":"normal",fontSize:h.size?`${h.size*0.75}px`:"11px",marginBottom:"2px"}}>{h.text||<span style={{color:"#aaa"}}>{h.label}</span>}</div>
                    ))}</div>
                  </div>
                  <div style={{borderTop:"2px solid #000",marginTop:"4px"}}/>
                </div>
              ) : mode==="media" ? (
                <div style={{marginTop:"16px",padding:"16px",background:"#fff",borderRadius:"12px",color:"#000",fontFamily:"Arial,sans-serif",fontSize:"11px",lineHeight:"1.8"}}>
                  {mediaHeader.filter(h=>h.type!=="spacer").map(h=>(
                    <div key={h.key} style={{fontWeight:h.bold?"bold":"normal",fontSize:h.size?`${h.size*0.75}px`:"11px",marginBottom:"3px"}}>{h.text||<span style={{color:"#aaa"}}>{h.label}</span>}</div>
                  ))}
                  <div style={{borderTop:"2px solid #000",marginTop:"8px"}}/>
                </div>
              ) : mode==="play" ? (
                <div style={{marginTop:"16px",padding:"20px",background:"#fff",borderRadius:"12px",color:"#000",fontFamily:`${docFont||"Times New Roman"},serif`,fontSize:"11px",lineHeight:"1.7"}}>
                  {playHeader.filter(h=>h.type!=="spacer").map(h=>(
                    <div key={h.key} style={{fontWeight:h.bold?"bold":"normal",fontStyle:h.italic?"italic":"normal",fontSize:h.size?`${h.size*0.75}px`:"11px",textAlign:h.align||"left",marginBottom:"3px"}}>{h.text||<span style={{color:"#aaa"}}>{h.label}</span>}</div>
                  ))}
                </div>
              ) : (
                <div style={{marginTop:"16px",padding:"20px",background:"#fff",borderRadius:"12px",color:"#000",fontFamily:"'Courier New',monospace",fontSize:"11px",lineHeight:"1.6"}}>
                  <div style={{height:"40px"}}/>
                  <div style={{textAlign:"center",textTransform:"uppercase",marginBottom:"8px",fontWeight:"bold"}}>{titlePage.title||<span style={{color:"#aaa"}}>НАЗВАНИЕ</span>}</div>
                  <div style={{textAlign:"center",marginBottom:"4px"}}>{titlePage.genre||<span style={{color:"#aaa"}}>жанр</span>}</div>
                  <div style={{textAlign:"center",marginBottom:"3px",color:"#555",fontSize:"10px"}}>Автор</div>
                  <div style={{textAlign:"center",marginBottom:"20px"}}>{titlePage.author||<span style={{color:"#aaa"}}>Имя Фамилия</span>}</div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"#555"}}>
                    <div>{[titlePage.phone,titlePage.email].filter(Boolean).join("\n")||<span style={{color:"#ccc"}}>контакты</span>}</div>
                    <div>{titlePage.year}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{padding:"16px 20px",borderTop:`1px solid ${T3}22`,flexShrink:0,maxWidth:"420px",width:"100%",margin:"0 auto",boxSizing:"border-box"}}>
            <div style={{position:"relative",display:"flex",flexDirection:"column",gap:"10px"}}>
              <button onClick={showPreview} style={{
                  width:"100%",padding:"10px",background:"transparent",border:`1px solid ${T3}44`,
                  borderRadius:"12px",color:T2,fontSize:"11px",cursor:"pointer",
                  fontFamily:"inherit",letterSpacing:"2px",
                  opacity:newProjectOverlay?0:1,pointerEvents:newProjectOverlay?"none":"auto",
                }}>◉ ПРЕДПРОСМОТР</button>
              <button onClick={
                titlePageOpen==="docx" ? exportDOCX :
                titlePageOpen==="fdx"  ? exportFDX  :
                titlePageOpen==="txt"  ? exportTXT  : exportPDF
              } style={{
                width:"100%",padding:"14px",background:SURF,border:`1px solid ${mc}44`,
                borderRadius:"12px",color:mc,fontSize:"12px",cursor:"pointer",
                fontFamily:"inherit",letterSpacing:"2px",boxShadow:SH_SM,
                opacity:newProjectOverlay?0:1,pointerEvents:newProjectOverlay?"none":"auto",
              }}>{titlePageOpen==="pdf"?"⎙ ЭКСПОРТ PDF":titlePageOpen==="docx"?"W ЭКСПОРТ DOCX":titlePageOpen==="fdx"?"F ЭКСПОРТ FDX":"T ЭКСПОРТ TXT"}</button>
              {newProjectOverlay && (
                <div style={{position:"absolute",inset:0,background:BG,display:"flex",alignItems:"center",justifyContent:"center",padding:"6px",boxSizing:"border-box"}}>
                  <button onClick={finishNewProjectOverlay} style={{
                    width:"100%",padding:"14px",background:SURF,border:`1px solid ${mc}44`,
                    borderRadius:"12px",color:mc,fontSize:"12px",cursor:"pointer",
                    fontFamily:"inherit",letterSpacing:"2px",boxShadow:SH_SM,
                  }}>СОЗДАТЬ</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ DESKTOP: previewOpen ══ */}
      {previewOpen && (() => {
        const pw = previewW || Math.round(window.innerWidth * 0.6);
        const ph = previewW ? Math.round(previewW * 1.2) : Math.round(window.innerHeight * 0.85);
        const onDragStart = (e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startW = pw;
          const onMove = (ev) => {
            const newW = Math.max(400, Math.min(window.innerWidth - 100, startW + (ev.clientX - startX) * 2));
            setPreviewW(newW);
          };
          const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
          };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        };
        return (
          <div onClick={()=>{setPreviewOpen(false);setPreviewW(null);}} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div onClick={e=>e.stopPropagation()} style={{width:`${pw}px`,height:`${ph}px`,maxHeight:"95vh",background:SURF,display:"flex",flexDirection:"column",borderRadius:"16px",boxShadow:"0 8px 48px rgba(0,0,0,0.6)",overflow:"hidden"}}>
              <div style={{padding:"12px 16px",display:"flex",alignItems:"center",flexShrink:0,borderBottom:`1px solid ${T3}22`}}>
                <span style={{color:T1,fontSize:"11px",letterSpacing:"3px",flex:1}}>ПРЕДПРОСМОТР</span>
                {/* Resize handle */}
                <div onMouseDown={onDragStart} style={{cursor:"ew-resize",padding:"4px 8px",color:T3,fontSize:"14px",userSelect:"none"}} title="Тянуть для изменения размера">⇔</div>
                <button onClick={()=>{ const f=document.querySelector('iframe[title="preview"]'); if(f){f.contentWindow.focus();f.contentWindow.print();} }} style={{background:"transparent",border:`1px solid ${T3}44`,borderRadius:"8px",color:T2,fontSize:"10px",letterSpacing:"2px",cursor:"pointer",padding:"4px 12px",fontFamily:"inherit"}}>⎙ ПЕЧАТЬ</button>
                <button onClick={()=>{setPreviewOpen(false);setPreviewW(null);}} style={{background:"transparent",border:"none",color:T2,fontSize:"18px",cursor:"pointer",padding:"0",lineHeight:1}}>✕</button>
              </div>
              <iframe srcDoc={previewHtml} style={{flex:1,border:"none",background:"#fff",width:"100%",minHeight:"1123px"}} title="preview"/>
            </div>
          </div>
        );
      })()}

      {/* ══ LEFT SIDEBAR ══ */}
      <div style={{
        width:`${leftW}px`, minWidth:`${leftW}px`,
        background: SURF,
        boxShadow: "4px 0 20px rgba(0,0,0,0.4)",
        display:"flex", flexDirection:"column", overflow:"hidden",
      }}>

        {/* Logo */}
        <div style={{padding:"16px 14px 12px", display:"flex", alignItems:"center"}}>
          <div style={{
            width:"36px", height:"36px", borderRadius:"10px",
            background: BG, boxShadow: SH_SM,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          }}>
            <Whale size={22}/>
          </div>
          <div style={{flex:1}}>
            <div style={{color:T1, fontSize:"12px", letterSpacing:"3px"}}>OLD WHALE</div>
            <div style={{color:T3, fontSize:"9px", letterSpacing:"2px"}}>РЕДАКТОР</div>
          </div>
          <button onClick={()=>setMenuOpen(o=>!o)} style={{
            width:"28px",height:"28px",borderRadius:"8px",background:BG,boxShadow:SH_SM,
            border:"none",cursor:"pointer",display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",flexShrink:0,padding:"0",
          }}>
            {[0,1,2].map(i=>(<span key={i} style={{display:"block",width:"12px",height:"1.5px",background:T2,borderRadius:"2px",marginTop:i>0?"3px":0}}/>))}
          </button>
        </div>

        {/* Mode tabs */}
        <div style={{
          display:"flex", margin:"0 10px 10px",
          background: BG, borderRadius:"12px", padding:"5px",
          boxShadow: SH_IN,
        }}>
          {MODES.map(m=>(
            <button key={m.id} title={m.label} onClick={()=>switchMode(m.id)} style={{
              flex:1, padding:"8px 4px", border:"none",
              background: mode===m.id ? SURF : "transparent",
              boxShadow: mode===m.id ? SH_SM : "none",
              borderRadius:"12px",
              color: mode===m.id ? "#fff" : T3,
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", transition:"all .25s",
            }}>{m.icon}</button>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          margin:"0 10px 8px",
          background: BG, borderRadius:"10px",
          boxShadow: SH_IN,
          padding:"8px 12px",
          display:"flex",
        }}>
          {[["ХРН",st.timing],["СТР",st.pages],["СЛВ",st.words]].map(([l,v])=>(
            <div key={l} style={{flex:1, textAlign:"center"}}>
              <div style={{color:T3, fontSize:"8px", letterSpacing:"1px"}}>{l}</div>
              <div style={{color:T2, fontSize:"11px", marginTop:"2px"}}>{v}</div>
            </div>
          ))}
        </div>

        {/* МОИ ПРОЕКТЫ */}
        <div style={{padding:"0 10px 8px"}}>
          <button onClick={()=>openProjectsList()} style={{
            width:"100%", padding:"8px 12px",
            background: BG, boxShadow: SH_SM,
            border:`1px solid ${mc}44`, borderRadius:"10px",
            color: mc, fontSize:"9px", cursor:"pointer",
            fontFamily:"inherit", letterSpacing:"2px",
            display:"flex", alignItems:"center", justifyContent:"center",
            WebkitAppearance:"none",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:"6px"}}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            МОИ ПРОЕКТЫ
          </button>
        </div>

        {/* Scene list */}
        <div style={{flex:1, overflow:"auto", padding:"4px 8px", position:"relative"}}>
          {/* Selection action bar */}
          <div style={{
            display:"flex", padding:"4px 2px 6px",
            opacity: selectedScenes.size > 0 ? 1 : 0,
            transition:"opacity .2s", pointerEvents: selectedScenes.size > 0 ? "auto" : "none",
            position:"relative",
          }}>
            {/* Тост */}
            {copyToast && (
              <div style={{
                position:"absolute", top:"-32px", left:"50%", transform:"translateX(-50%)",
                background:mc, color:"#000", fontSize:"9px", letterSpacing:"1px",
                padding:"4px 10px", borderRadius:"8px", whiteSpace:"nowrap",
                pointerEvents:"none", zIndex:100,
              }}>✓ СКОПИРОВАНО</div>
            )}
            <button onClick={copySelectedScenes} style={{
              flex:1,padding:"6px",
              background:selectedScenes.size>0?(copyToast?"#4ade80":mc):"transparent",
              border:"none",borderRadius:"10px",
              color:selectedScenes.size>0?"#000":"transparent",
              fontSize:"9px",letterSpacing:"1px",cursor:"pointer",fontFamily:"inherit",fontWeight:"bold",
              WebkitAppearance:"none",
              transition:"background .3s",
            }}>{copyToast ? "✓ СКОПИРОВАНО" : `КОПИРОВАТЬ (${selectedScenes.size})`}</button>
            <button onClick={()=>{
              const ids=[...selectedScenes];
              ids.forEach(id=>delScene(id));
              setSelectedScenes(new Set());
            }} style={{
              padding:"6px 10px",background:SURF,border:"none",borderRadius:"10px",
              color:T2,fontSize:"9px",cursor:"pointer",fontFamily:"inherit",
              WebkitAppearance:"none",
            }}>🗑</button>
          </div>

          <div style={{color:T3, fontSize:"9px", letterSpacing:"2px", padding:"0px 6px 8px"}}>
            СЦЕНЫ — {scenes.filter(s=>s.kind!=="act").length}
          </div>

          {scenes.map((s,idx)=>(
            <div key={s.id}>
              {/* Drop indicator */}
              <div style={{
                height: dragSceneId && dragOverId===s.id ? "4px" : "0px",
                background: mc,
                borderRadius:"2px",
                transition:"height .15s",
                marginBottom: dragSceneId && dragOverId===s.id ? "6px" : "0px",
                flexShrink:0,
              }}/>
              <div
                ref={el=>sceneCardRefs.current[s.id]=el}
                data-scene-id={s.id}
                onMouseDown={e=>{
                  if (e.button !== 0) return;
                  dragStartY.current = e.clientY;
                  let dragging = false;
                  const card = sceneCardRefs.current[s.id];
                  const onMove = (ev) => {
                    if (!dragging) {
                      if (Math.abs(ev.clientY - dragStartY.current) < 5) return;
                      dragging = true;
                      setDragCardH(card ? card.offsetHeight : 60);
                      setDragPos({x: ev.clientX, y: ev.clientY});
                      _setDragSceneId.current(s.id);
                    }
                    if (!_dragSceneId.current) return;
                    setDragPos({x: ev.clientX, y: ev.clientY});
                    let foundId = null;
                    for (const sc of scenes) {
                      if (sc.kind === "act") continue;
                      const el = sceneCardRefs.current[sc.id];
                      if (!el) continue;
                      const r = el.getBoundingClientRect();
                      if (ev.clientY >= r.top && ev.clientY <= r.bottom) { foundId = sc.id; break; }
                    }
                    if (foundId && foundId !== _dragSceneId.current) _setDragOverId.current(foundId);
                    else if (!foundId) _setDragOverId.current(null);
                  };
                  const onUp = () => {
                    if (_dragSceneId.current && _dragOverId.current && _dragSceneId.current !== _dragOverId.current) {
                      moveScene(_dragSceneId.current, _dragOverId.current);
                      _dragJustEnded.current = true;
                      setTimeout(()=>{ _dragJustEnded.current = false; }, 300);
                    }
                    _setDragSceneId.current(null);
                    _setDragOverId.current(null);
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                  };
                  document.addEventListener('mousemove', onMove);
                  document.addEventListener('mouseup', onUp);
                }}
                onClick={()=>{
                  if (_dragSceneId.current || _dragJustEnded.current) return;
                  if (selectedScenes.size > 0) {
                    if (s.kind === "act") toggleActSelect(s.actNum);
                    else toggleSceneSelect(s.id);
                    return;
                  }
                  goToScene(s.id);
                }}
                style={{
                  padding:"8px 10px", borderRadius:"14px", cursor:"grab", marginBottom:"4px",
                  background: activeSceneId===s.id ? BG : "transparent",
                  boxShadow: activeSceneId===s.id ? SH_IN : "none",
                  borderLeft:`3px solid ${selectedScenes.has(s.id)?mc:activeSceneId===s.id?mc:"transparent"}`,
                  transition:"all .22s",
                  opacity: dragSceneId===s.id ? 0 : 1,
                  userSelect:"none", WebkitUserSelect:"none",
                }}>
                <div style={{display:"flex", alignItems:"center"}}>
                  {/* Checkbox for scenes, act-checkbox for acts */}
                  {s.kind === "act" ? (
                    <div onClick={e=>{if(_dragSceneId.current||_dragJustEnded.current)return;e.stopPropagation();toggleActSelect(s.actNum);}} style={{
                      width:"16px",height:"16px",borderRadius:"5px",flexShrink:0,cursor:"pointer",marginRight:"6px",
                      border:`2px solid ${scenes.filter(ss=>ss.kind==="scene"&&ss.actNum===s.actNum).every(ss=>selectedScenes.has(ss.id))&&scenes.filter(ss=>ss.kind==="scene"&&ss.actNum===s.actNum).length>0?mc:T3+"99"}`,
                      background:scenes.filter(ss=>ss.kind==="scene"&&ss.actNum===s.actNum).every(ss=>selectedScenes.has(ss.id))&&scenes.filter(ss=>ss.kind==="scene"&&ss.actNum===s.actNum).length>0?mc:"transparent",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      transition:"border-color .15s",
                    }}>{scenes.filter(ss=>ss.kind==="scene"&&ss.actNum===s.actNum).every(ss=>selectedScenes.has(ss.id))&&scenes.filter(ss=>ss.kind==="scene"&&ss.actNum===s.actNum).length>0&&<span style={{color:"#000",fontSize:"9px",fontWeight:"bold"}}>✓</span>}</div>
                  ) : (
                    <div onClick={e=>{if(_dragSceneId.current||_dragJustEnded.current)return;e.stopPropagation();toggleSceneSelect(s.id);}} style={{
                      width:"16px",height:"16px",borderRadius:"5px",flexShrink:0,cursor:"pointer",marginRight:"6px",
                      border:`2px solid ${selectedScenes.has(s.id)?mc:T3+"99"}`,
                      background:selectedScenes.has(s.id)?mc:"transparent",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      transition:"border-color .15s",
                    }}>{selectedScenes.has(s.id)&&<span style={{color:"#000",fontSize:"9px",fontWeight:"bold"}}>✓</span>}</div>
                  )}
                  <span style={{color: activeSceneId===s.id ? mc : T3, fontSize:"10px", minWidth:"16px", flexShrink:0}}>{s.num}.</span>
                  <span style={{
                    color: s.kind==="act" ? mc : activeSceneId===s.id ? T1 : T2,
                    fontSize: s.kind==="act" ? "10px" : "11px",
                    fontWeight: s.kind==="act" ? "bold" : "normal",
                    letterSpacing: s.kind==="act" ? "1px" : "0",
                    lineHeight:"1.4",
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                    flex:1, minWidth:0,
                  }}>{s.text || "—"}</span>
                  {/* Dup/Del buttons — показываем при hover через CSS не работает в inline, покажем всегда маленькими */}
                  {s.kind !== "act" && (
                    <div style={{display:"flex", flexShrink:0}}>
                      <button onMouseDown={e=>{e.stopPropagation();e.preventDefault();}} onClick={e=>{e.stopPropagation();dupScene(s.id);}} style={{
                        background:`${mc}11`,border:`1px solid ${mc}33`,borderRadius:"4px",color:mc,fontSize:"10px",cursor:"pointer",padding:"1px 4px",lineHeight:1,
                      }}>⧉</button>
                      <button onMouseDown={e=>{e.stopPropagation();e.preventDefault();}} onClick={e=>{e.stopPropagation();delScene(s.id);}} style={{
                        background:"#f8717108",border:"1px solid #f8717118",borderRadius:"4px",color:"#f87171",fontSize:"11px",cursor:"pointer",padding:"1px 4px",lineHeight:1,
                      }}><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="1" x2="7" y2="7"/><line x1="7" y1="1" x2="1" y2="7"/></svg></button>
                    </div>
                  )}
                </div>
                {s.cast && s.kind !== "act" && (
                  <div style={{color:T3, fontSize:"10px", paddingLeft:"20px", marginTop:"2px",
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
                    {s.cast}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Ghost card during drag */}
          {dragSceneId && (()=>{
            const s = scenes.find(x=>x.id===dragSceneId);
            if (!s) return null;
            return (
              <div style={{
                position:"fixed",
                top: dragPos.y - dragCardH/2,
                left: dragPos.x - 90,
                width:"180px",
                background:SURF, borderRadius:"14px",
                boxShadow:"0 8px 24px rgba(0,0,0,0.5)",
                padding:"8px 10px", opacity:0.92,
                pointerEvents:"none", zIndex:9999,
              }}>
                <div style={{display:"flex", alignItems:"center"}}>
                  <span style={{color:mc, fontSize:"10px"}}>{s.num}.</span>
                  <span style={{color:T1, fontSize:"11px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", flex:1}}>{s.text||"—"}</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* New scene */}
        <div style={{padding:"8px 10px"}}>
          <button onClick={()=>{ const last=blocks[blocks.length-1]; if(last) addAfter(last.id,"scene"); }} style={{
            width:"100%", padding:"10px",
            background: BG, boxShadow: SH_SM,
            border:"none", borderRadius:"14px",
            color: T2, fontSize:"10px", cursor:"pointer",
            fontFamily:"inherit", letterSpacing:"2px",
            transition:"all .22s",
          }}>+ НОВАЯ СЦЕНА</button>
        </div>

        {/* Credits */}
        <div style={{
          margin:"4px 10px 10px",
          background: BG, borderRadius:"12px",
          boxShadow: SH_IN, padding:"10px 12px",
        }}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px"}}>
            <span style={{color:T3, fontSize:"9px", letterSpacing:"1px"}}>КРЕДИТЫ</span>
            <span style={{color: credits<50 ? "#ef4444" : T1, fontSize:"13px", fontWeight:"bold"}}>{credits}</span>
          </div>
          <div style={{background:SURF, borderRadius:"3px", height:"3px", marginBottom:"8px", boxShadow:SH_IN}}>
            <div style={{height:"100%", borderRadius:"3px",
              width:`${Math.min(100,(credits/500)*100)}%`,
              background: credits<50 ? "#ef4444" : mc,
              boxShadow: `0 0 8px ${mc}88`,
              transition:"all .3s"
            }}/>
          </div>
          <div style={{display:"flex"}}>
            <button style={{
              flex:1, padding:"7px",
              background: SURF, boxShadow: SH_SM,
              border:"none", borderRadius:"8px",
              color: mc, fontSize:"9px", cursor:"pointer",
              fontFamily:"inherit", letterSpacing:"1px",
            }}>ПОПОЛНИТЬ</button>
            <button onClick={onLogout} style={{
              padding:"7px 10px",
              background: SURF, boxShadow: SH_SM,
              border:"none", borderRadius:"8px",
              color: T3, fontSize:"12px", cursor:"pointer",
              fontFamily:"inherit",
            }} title="Выйти">⏻</button>
          </div>
        </div>
      </div>

      {/* ══ DRAG HANDLE: LEFT ══ */}
      <div
        onMouseDown={e=>{
          e.preventDefault();
          const startX=e.clientX, startW=leftW;
          const onMove=ev=>setLeftW(Math.max(160,Math.min(360,startW+(ev.clientX-startX))));
          const onUp=()=>{window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseup",onUp);};
          window.addEventListener("mousemove",onMove);
          window.addEventListener("mouseup",onUp);
        }}
        style={{width:"4px",cursor:"ew-resize",background:"transparent",flexShrink:0,zIndex:10,
          transition:"background .15s"}}
        onMouseEnter={e=>e.currentTarget.style.background=`${ACCENT}55`}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
      />

      {/* ══ EDITOR AREA ══ */}
      <div style={{flex:1, display:"flex", flexDirection:"column", overflow:"hidden"}}>

        {/* Top bar */}
        <div className="topbar-hover" style={{
          height:"40px", background: SURF,
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
          display:"flex", alignItems:"center",
          padding:"0 12px", flexShrink:0,
          overflow:"hidden",
        }}>
          <span style={{color:T3, fontSize:"10px", letterSpacing:"1px", flexShrink:0, whiteSpace:"nowrap", marginRight:"8px"}}>
            {MODES.find(m=>m.id===mode)?.icon} {MODES.find(m=>m.id===mode)?.label.toUpperCase()}
          </span>
          <div style={{flex:1, minWidth:"4px"}}/>
          {/* Статистика — схлопывается первой */}
          <div style={{display:"flex", alignItems:"center", flexShrink:1, overflow:"hidden", minWidth:0}}>
            {[["ХРН.",st.timing],["СТР.",st.pages],["СЛОВ",st.words],["СИМВ.",st.chars]].map(([l,v])=>(
              <span key={l} style={{fontSize:"9px", color:T3, letterSpacing:"1px", flexShrink:0, whiteSpace:"nowrap", marginRight:"10px"}}>
                {l}<span style={{color:T2, marginLeft:"3px"}}>{v}</span>
              </span>
            ))}
          </div>
          {/* Правый блок кнопок — никогда не переносится */}
          <div style={{display:"flex", alignItems:"center", flexShrink:0}}>
            <div style={{display:"flex", alignItems:"center", marginRight:"8px"}}>
              <div style={{
                width:"5px", height:"5px", borderRadius:"50%",
                background: saved ? "#4ade80" : "#f472b6",
                boxShadow: saved ? "0 0 6px #4ade8088" : "0 0 6px #f472b688",
                transition:"all .5s", marginRight:"4px",
              }}/>
              <span style={{fontSize:"9px", color:T3, letterSpacing:"1px", whiteSpace:"nowrap"}}>{saved?"СОХР.":"СОХР..."}</span>
            </div>
            <button onMouseDown={e=>e.preventDefault()} onClick={()=>setSpellOn(v=>!v)}
              title={spellOn?"Выключить проверку орфографии":"Включить проверку орфографии"}
              style={{
                padding:"4px 10px", position:"relative", marginRight:"6px",
                background: spellOn ? mc+"33" : BG,
                boxShadow: spellOn ? SH_IN : SH_SM,
                border:"none", borderRadius:"8px",
                color: spellOn ? mc : T3,
                fontSize:"10px", cursor:"pointer",
                fontFamily:"inherit", letterSpacing:"1px",
                transition:"all .2s", whiteSpace:"nowrap",
                WebkitAppearance:"none",
              }}>АБВ</button>
            <div style={{display:"flex",alignItems:"center", marginRight:"6px"}}>
              <button onMouseDown={e=>e.preventDefault()} onClick={()=>setZoom(z=>Math.max(50,z-10))}
                style={{width:"22px",height:"22px",background:BG,boxShadow:SH_SM,border:"none",borderRadius:"6px",color:T2,fontSize:"14px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,WebkitAppearance:"none"}}>−</button>
              <span style={{fontSize:"9px",color:T3,minWidth:"30px",textAlign:"center",letterSpacing:"1px"}}>{zoom}%</span>
              <button onMouseDown={e=>e.preventDefault()} onClick={()=>setZoom(z=>Math.min(200,z+10))}
                style={{width:"22px",height:"22px",background:BG,boxShadow:SH_SM,border:"none",borderRadius:"6px",color:T2,fontSize:"14px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,WebkitAppearance:"none"}}>+</button>
            </div>
            <button onClick={()=>setAiOpen(!aiOpen)} style={{
              padding:"4px 10px",
              background: aiOpen ? BG : SURF,
              boxShadow: aiOpen ? SH_IN : SH_SM,
              border:"none", borderRadius:"8px",
              color: aiOpen ? mc : T2,
              fontSize:"10px", cursor:"pointer",
              fontFamily:"inherit", letterSpacing:"1px",
              transition:"all .2s", whiteSpace:"nowrap",
              WebkitAppearance:"none",
            }}>ИИ {aiOpen ? "▶" : "◀"}</button>
          </div>
        </div>

        {/* Document */}
        <div ref={scrollRef} onScroll={onScroll}
          onMouseDown={e=>{
            if(e.button!==1) return;
            e.preventDefault();
            const el=scrollRef.current; if(!el) return;
            const sx=e.clientX, sy=e.clientY, sl=el.scrollLeft, st=el.scrollTop;
            const onMove=ev=>{el.scrollLeft=sl-(ev.clientX-sx);el.scrollTop=st-(ev.clientY-sy);};
            const onUp=()=>{window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseup",onUp);};
            window.addEventListener("mousemove",onMove);
            window.addEventListener("mouseup",onUp);
          }}
          style={{flex:1, overflow:"auto", cursor:"auto", background:BG}}>
          <div style={{minWidth: zoom > 100 ? `${zoom}%` : undefined}}>
          <div style={{
            maxWidth:"750px", margin:"0 auto",
            padding: mode==="note" ? "48px 40px" : "32px 0",
            fontFamily: mode==="play" ? `${docFont||"Times New Roman"},serif` : undefined,
            zoom: zoom !== 100 ? `${zoom}%` : undefined,
            transition:"zoom .15s",
          }}>

            {mode==="note" && (()=>{
              const noteToolbar = [
                { cmd:"bold",          icon:"Ж", title:"Жирный",        style:{fontWeight:"bold",fontFamily:"serif"} },
                { cmd:"italic",        icon:"К", title:"Курсив",        style:{fontStyle:"italic",fontFamily:"serif"} },
                { cmd:"underline",     icon:"Ч", title:"Подчёркнутый",  style:{textDecoration:"underline"} },
                { cmd:"removeFormat", icon:"Н", title:"Убрать форматирование", isBlock:false, style:{} },
                { sep:true },
                { cmd:"insertUnorderedList", icon:"•≡", title:"Список" },
                { cmd:"insertOrderedList",   icon:"1≡", title:"Нумерованный список" },
                { sep:true },
                { cmd:"h1", icon:"H1", title:"Заголовок 1", isBlock:true },
                { cmd:"h2", icon:"H2", title:"Заголовок 2", isBlock:true },
                { cmd:"formatBlock", arg:"p", icon:"¶", title:"Обычный текст" },
              ];
              const execFmt = (cmd, arg) => {
                document.execCommand(cmd, false, arg||null);
              };
              const applyFontSize = (pt) => {
                const editor = noteEditorRef.current;
                if (!editor) return;
                editor.focus();
                const sel = window.getSelection();
                if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
                const range = sel.getRangeAt(0);
                const span = document.createElement("span");
                span.style.fontSize = pt + "pt";
                try {
                  range.surroundContents(span);
                } catch(e) {
                  const frag = range.extractContents();
                  span.appendChild(frag);
                  range.insertNode(span);
                }
                const newRange = document.createRange();
                newRange.selectNodeContents(span);
                sel.removeAllRanges();
                sel.addRange(newRange);
                noteSelRangeRef.current = newRange.cloneRange();
                const html = editor.innerHTML;
                noteTextRef.current = html;
                setNoteText(html);
                markDirty();
              };
              const FONT_SIZES = [8,10,11,12,13,14,16,18,20,24,28,32,36];
              const NOTE_COLORS = ["#e8e4d8","#f472b6","#60a5fa","#4ade80","#fbbf24","#a78bfa","#f87171","#34d399"];
              const saveNoteSelection = () => {
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) noteSelRangeRef.current = sel.getRangeAt(0).cloneRange();
              };
              const restoreNoteSelection = () => {
                const sel = window.getSelection();
                if (!sel) return false;
                sel.removeAllRanges();
                if (noteSelRangeRef.current) {
                  sel.addRange(noteSelRangeRef.current);
                  return true;
                }
                return false;
              };
              const applyNoteColor = (color) => {
                const editor = noteEditorRef.current;
                if (!editor) return;
                editor.focus();
                restoreNoteSelection();
                execFmt("foreColor", color);
                const html = editor.innerHTML;
                noteTextRef.current = html;
                setNoteText(html);
                markDirty();
                scheduleNoteHistorySnapshot(html);
                setNoteColorOpen(false);
              };
              const alignSVG = {
                left:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>,
                center: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>,
                right:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>,
              };
              const btnSt = (active) => ({
                width:"26px", height:"26px", borderRadius:"6px",
                background: active ? `${mc}22` : "transparent",
                border:`1px solid ${active ? mc : T3+"33"}`,
                color: active ? mc : T2,
                fontSize:"11px", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                marginRight:"3px", WebkitAppearance:"none", flexShrink:0,
              });
              return (
                <div style={{display:"flex", flexDirection:"column", minHeight:"70vh"}}>
                  {/* Toolbar */}
                  <div style={{
                    display:"flex", alignItems:"center", flexWrap:"wrap",
                    padding:"8px 0 10px", marginBottom:"12px",
                    borderBottom:`1px solid ${T3}22`,
                  }}>
                    {noteToolbar.slice(0,4).map((t,i)=> t.sep
                      ? <div key={i} style={{width:"1px",height:"18px",background:T3+"33",marginRight:"6px"}}/>
                      : <button key={i}
                          title={t.title}
                          onMouseDown={e=>{
                            e.preventDefault();
                            const editor = noteEditorRef.current;
                            if (!editor) return;
                            editor.focus();
                            restoreNoteSelection();
                            if(t.isBlock){
                              const cur = String(document.queryCommandValue("formatBlock") || "").toLowerCase();
                              execFmt("formatBlock", cur===t.cmd.toLowerCase()?"p":t.cmd);
                            } else {
                              execFmt(t.cmd, t.arg);
                            }
                            const html = editor.innerHTML;
                            noteTextRef.current = html;
                            setNoteText(html);
                            markDirty();
                            scheduleNoteHistorySnapshot(html);
                            saveNoteSelection();
                          }}
                          style={{...btnSt(false), ...(t.style||{}), fontSize:typeof t.icon==="string"&&t.icon.length>1?"9px":"11px"}}>
                          {t.icon}
                        </button>
                    )}
                    <div style={{position:"relative",marginRight:"3px"}}>
                      <button
                        title="Цвет текста"
                        onMouseDown={e=>{e.preventDefault(); e.stopPropagation(); saveNoteSelection(); setNoteColorOpen(v=>!v);}}
                        style={{
                          width:"26px",height:"26px",borderRadius:"6px",
                          border:`1px solid ${T3}33`,background:"transparent",cursor:"pointer",
                          padding:"0",display:"flex",alignItems:"center",justifyContent:"center",
                          WebkitAppearance:"none",
                        }}>
                        <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"#a9a6c9",boxShadow:"0 0 0 1px rgba(255,255,255,0.08) inset"}}/>
                      </button>
                      {noteColorOpen && (
                        <div style={{position:"absolute",bottom:"32px",left:0,background:SURF,borderRadius:"12px",
                          boxShadow:"0 8px 24px rgba(0,0,0,0.5)",padding:"8px",zIndex:100,
                          display:"flex",flexWrap:"nowrap",width:"max-content"}}>
                          {NOTE_COLORS.map(c=>(
                            <button key={c}
                              onMouseDown={e=>{e.preventDefault(); e.stopPropagation(); applyNoteColor(c);}}
                              style={{width:"20px",height:"20px",borderRadius:"50%",background:c,
                                border:"2px solid transparent",cursor:"pointer",marginRight:"4px",marginBottom:"4px",
                                WebkitAppearance:"none"}}/>
                          ))}
                          <button
                            onMouseDown={e=>{e.preventDefault(); e.stopPropagation(); setNoteColorOpen(false);}}
                            title="Закрыть"
                            style={{width:"20px",height:"20px",borderRadius:"50%",background:"transparent",
                              border:"1px dashed "+T3,cursor:"pointer",fontSize:"10px",color:T3,
                              display:"flex",alignItems:"center",justifyContent:"center",WebkitAppearance:"none"}}>
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke={T3} strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="1" x2="7" y2="7"/><line x1="7" y1="1" x2="1" y2="7"/></svg>
                          </button>
                        </div>
                      )}
                    </div>
                    {noteToolbar.slice(4).map((t,i)=> t.sep
                      ? <div key={`tail-${i}`} style={{width:"1px",height:"18px",background:T3+"33",marginRight:"6px"}}/>
                      : <button key={`tail-${i}`}
                          title={t.title}
                          onMouseDown={e=>{
                            e.preventDefault();
                            const editor = noteEditorRef.current;
                            if (!editor) return;
                            editor.focus();
                            restoreNoteSelection();
                            if(t.isBlock){
                              const cur = String(document.queryCommandValue("formatBlock") || "").toLowerCase();
                              execFmt("formatBlock", cur===t.cmd.toLowerCase()?"p":t.cmd);
                            } else {
                              execFmt(t.cmd, t.arg);
                            }
                            const html = editor.innerHTML;
                            noteTextRef.current = html;
                            setNoteText(html);
                            markDirty();
                            scheduleNoteHistorySnapshot(html);
                            saveNoteSelection();
                          }}
                          style={{...btnSt(false), ...(t.style||{}), fontSize:typeof t.icon==="string"&&t.icon.length>1?"9px":"11px"}}>
                          {t.icon}
                        </button>
                    )}
                    {/* Divider */}
                    <div style={{width:"1px",height:"18px",background:T3+"33",marginRight:"6px"}}/>
                    {/* Выравнивание — 1 кнопка + дропдаун */}
                    <div style={{position:"relative",marginRight:"3px"}}>
                      <button title="Выравнивание"
                        onMouseDown={e=>{e.preventDefault(); setNoteAlignOpen(o=>!o);}}
                        style={{...btnSt(noteAlignOpen)}}>
                        {alignSVG[noteAlign]}
                      </button>
                      {noteAlignOpen && (
                        <div style={{position:"absolute",top:"30px",left:0,background:SURF,
                          borderRadius:"8px",boxShadow:"0 8px 24px rgba(0,0,0,0.45)",
                          padding:"4px",zIndex:50,minWidth:"150px"}}>
                          {[
                            {cmd:"justifyLeft",   align:"left",   label:"По левому краю"},
                            {cmd:"justifyCenter", align:"center", label:"По центру"},
                            {cmd:"justifyRight",  align:"right",  label:"По правому краю"},
                          ].map(a=>(
                            <button key={a.align}
                              onMouseDown={e=>{
                                e.preventDefault();
                                const editor = noteEditorRef.current;
                                if (!editor) return;
                                editor.focus();
                                restoreNoteSelection();
                                execFmt(a.cmd);
                                const html = editor.innerHTML;
                                noteTextRef.current = html;
                                setNoteText(html);
                                markDirty();
                                scheduleNoteHistorySnapshot(html);
                                saveNoteSelection();
                                setNoteAlign(a.align);
                                setNoteAlignOpen(false);
                              }}
                              style={{display:"flex",alignItems:"center",width:"100%",
                                padding:"7px 10px",background:noteAlign===a.align?`${mc}22`:"transparent",
                                border:"none",borderRadius:"6px",cursor:"pointer",
                                color:noteAlign===a.align?mc:T2,gap:"8px",WebkitAppearance:"none"}}>
                              {alignSVG[a.align]}
                              <span style={{fontSize:"11px",whiteSpace:"nowrap"}}>{a.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Divider */}
                    <div style={{width:"1px",height:"18px",background:T3+"33",marginRight:"6px"}}/>
                    {/* Размер шрифта: − [N] + */}
                    <div style={{display:"flex",alignItems:"center",marginRight:"3px"}}>
                      <button
                        onMouseDown={e=>{e.preventDefault(); const s=Math.max(4,noteFontSize-1); setNoteFontSize(s); applyFontSize(s);}}
                        style={{...btnSt(false),width:"22px",fontSize:"14px",fontWeight:"300"}}>−</button>
                      <input
                        type="text"
                        key={noteFontSize}
                        defaultValue={noteFontSize}
                        onMouseDown={()=>{const sel=window.getSelection();if(sel&&sel.rangeCount>0)noteSelRangeRef.current=sel.getRangeAt(0).cloneRange();}}
                        onBlur={e=>{const v=parseInt(e.target.value);if(!isNaN(v)&&v>=4&&v<=96){const sel=window.getSelection();sel.removeAllRanges();if(noteSelRangeRef.current)sel.addRange(noteSelRangeRef.current);setNoteFontSize(v);applyFontSize(v);}}}
                        onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();const v=parseInt(e.target.value);if(!isNaN(v)&&v>=4&&v<=96){const sel=window.getSelection();sel.removeAllRanges();if(noteSelRangeRef.current)sel.addRange(noteSelRangeRef.current);setNoteFontSize(v);applyFontSize(v);}e.target.blur();}}}
                        style={{width:"28px",textAlign:"center",background:"transparent",border:`1px solid ${T3}33`,borderRadius:"4px",color:T2,fontSize:"10px",padding:"1px 2px",fontFamily:"inherit",outline:"none"}}
                      />
                      <button
                        onMouseDown={e=>{e.preventDefault(); const s=Math.min(96,noteFontSize+1); setNoteFontSize(s); applyFontSize(s);}}
                        style={{...btnSt(false),width:"22px",fontSize:"14px",fontWeight:"300"}}>+</button>
                    </div>
                  </div>
                  {/* Editor */}
                  <div
                    key={projectId}
                    ref={noteEditorRef}
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={spellOn}
                    onInput={e=>{const html=e.currentTarget.innerHTML;noteTextRef.current=html;setNoteText(html);markDirty();scheduleNoteHistorySnapshot(html); saveNoteSelection();}}
                    onFocus={()=>saveNoteSelection()}
                    onKeyUp={()=>saveNoteSelection()}
                    onMouseUp={()=>saveNoteSelection()}
                    onPaste={e=>{e.preventDefault();const text=e.clipboardData.getData('text/plain');document.execCommand('insertText',false,text);}}
                    data-placeholder="Мысли, идеи, наброски…"
                    style={{
                      flex:1, minHeight:"60vh", outline:"none",
                      color:T1, fontSize:"15px", lineHeight:"1.8",
                      fontFamily:`${docFont||"'Courier New'"},monospace`,
                      boxSizing:"border-box",
                      backgroundImage:`repeating-linear-gradient(to bottom, transparent 0, transparent 1026px, ${T3}44 1026px, ${T3}44 1027px)`,
                      backgroundAttachment:"local",
                    }}
                  />
                  <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:${T3};pointer-events:none;}`}</style>
                </div>
              );
            })()}

            {mode!=="note" && mode==="play" && (
              <PlayHeaderEditor
                items={playHeader} setItems={setPlayHeader}
                focKey={playHeaderFoc} setFocKey={setPlayHeaderFoc}
                T1={T1} T2={T2} T3={T3} SURF={SURF} BG={BG} mc={mc} SH_SM={SH_SM} docFont={docFont}
              />
            )}
            {mode!=="note" && (()=>{
              // А4 при 96dpi = 1123px, минус паддинги 48+48 = 1027px рабочей зоны
              const A4_H = 931; // рабочая высота A4 за вычетом отступов (1123-96-96)
              const FILM_PAGE_SPLIT_TYPES = ["action","paren","note"];
              const pageBreaks = new Map(); // bi -> charSplit (-1 = целый блок на новую стр)
              let runH = 0;
              const getBlockMetrics = (block, text, continued=false) => {
                const def = defs.find(d=>d.type===block.type)||defs[0];
                const basePt = parseInt(def.st?.paddingTop) || 0;
                const pt  = continued ? 0 : basePt;
                const pb  = parseInt(def.st?.paddingBottom)|| 0;
                const fs  = parseFloat(def.st?.fontSize)  || (mode==="play" ? 15 : 14);
                const lh  = parseFloat(def.st?.lineHeight) || (mode==="play" ? 1.7 : 1.85);
                let colW;
                if (mode==="film") {
                  if (block.type==="dialogue") colW = 340;
                  else if (block.type==="paren") colW = 300;
                  else if (block.type==="char") colW = 300;
                  else colW = 566;
                } else { colW = 670; }
                const charsPerLine = Math.max(20, Math.round(colW / (fs * 0.6)));
                const safeText = (text && text.length) ? text : " ";
                const totalLines = Math.max(1, Math.ceil(safeText.length / charsPerLine));
                const lineH = fs * lh;
                const blockH = pt + pb + totalLines * lineH + 10;
                return { def, pt, pb, fs, lh, colW, charsPerLine, lineH, blockH };
              };
              const findWordSplit = (text, approx) => {
                if (!text || text.length < 2) return -1;
                let splitAt = Math.min(text.length - 1, Math.max(1, approx));
                while (splitAt > 0 && text[splitAt] !== ' ' && text[splitAt] !== '\n') splitAt--;
                if (splitAt <= 0) splitAt = Math.min(text.length - 1, Math.max(1, approx));
                return splitAt > 0 && splitAt < text.length ? splitAt : -1;
              };
              const pageRemaining = () => {
                const used = runH % A4_H;
                return used === 0 ? A4_H : (A4_H - used);
              };
              const pushPage = () => {
                if (curPage.length > 0) pages.push(curPage);
                curPage = [];
                runH = Math.ceil(runH / A4_H) * A4_H;
              };

              blocks.forEach((block, bi) => {
                const def = defs.find(d=>d.type===block.type)||defs[0];
                const pt  = parseInt(def.st?.paddingTop)  || 0;
                const pb  = parseInt(def.st?.paddingBottom)|| 0;
                const fs  = parseFloat(def.st?.fontSize)  || (mode==="play" ? 15 : 14);
                const lh  = parseFloat(def.st?.lineHeight) || (mode==="play" ? 1.7 : 1.85);
                let colW;
                if (mode==="film") {
                  if (block.type==="dialogue") colW = 340;
                  else if (block.type==="paren") colW = 300;
                  else if (block.type==="char") colW = 300;
                  else colW = 566;
                } else { colW = 670; }
                const charsPerLine = Math.max(20, Math.round(colW / (fs * 0.6)));
                const text = block.text || " ";
                const totalLines = Math.max(1, Math.ceil(text.length / charsPerLine));
                const lineH = fs * lh;
                const blockH = pt + pb + totalLines * lineH + 10;
                const pageStart = Math.floor(runH / A4_H);
                const pageEnd = Math.floor((runH + blockH) / A4_H);
                if (bi > 0 && pageEnd > pageStart) {
                  const remaining = A4_H * (pageStart + 1) - runH - pt;
                  const linesFit = Math.floor(remaining / lineH);
                  if (linesFit <= 0) {
                    pageBreaks.set(bi, -1);
                  } else {
                    let splitAt = linesFit * charsPerLine;
                    if (splitAt >= text.length) {
                      pageBreaks.set(bi, -1);
                    } else {
                      // Для диалога — конец предложения, иначе — граница слова
                      if (block.type === "dialogue") {
                        let sentenceEnd = -1;
                        for (let si = splitAt; si > 0; si--) {
                          const c = text[si]; const next = text[si+1];
                          if (('.!?').includes(c) && (!next || next === ' ' || next === '\n')) {
                            sentenceEnd = si + 1; break;
                          }
                        }
                        if (sentenceEnd > 0) { splitAt = sentenceEnd; }
                        else { while (splitAt > 0 && text[splitAt] !== ' ' && text[splitAt] !== '\n') splitAt--; }
                      } else {
                        while (splitAt > 0 && text[splitAt] !== ' ' && text[splitAt] !== '\n') splitAt--;
                      }
                      pageBreaks.set(bi, splitAt > 0 ? splitAt : linesFit * charsPerLine);
                    }
                  }
                }
                runH += blockH;
              });

              // Строим страницы; для action/paren/note в Film режем продолжение по страницам как у dialogue, но без маркеров
              const pages = [];
              let curPage = [];
              runH = 0;

              blocks.forEach((block, bi) => {
                if (mode === "film" && FILM_PAGE_SPLIT_TYPES.includes(block.type)) {
                  const fullText = block.text || "";
                  const firstMetrics = getBlockMetrics(block, fullText, false);

                  // Если блок помещается целиком — оставляем как есть
                  if (firstMetrics.blockH <= pageRemaining()) {
                    curPage.push({bi, part:'full', split:-1});
                    runH += firstMetrics.blockH;
                    return;
                  }

                  let rest = fullText;
                  let start = 0;
                  let continued = false;
                  let sliceIx = 0;

                  while (true) {
                    const metrics = getBlockMetrics(block, rest, continued);
                    const remaining = pageRemaining();

                    if (metrics.blockH <= remaining) {
                      curPage.push({bi, part:'filmSlice', start, end:fullText.length, continued, editable:true, sliceIx});
                      runH += metrics.blockH;
                      break;
                    }

                    const linesFit = Math.floor(Math.max(0, remaining - metrics.pt) / metrics.lineH);

                    if (linesFit <= 0) {
                      pushPage();
                      continued = start > 0;
                      continue;
                    }

                    let splitLocal = findWordSplit(rest, linesFit * metrics.charsPerLine);
                    if ((splitLocal <= 0 || splitLocal >= rest.length) && curPage.length === 0) {
                      splitLocal = Math.min(rest.length - 1, Math.max(1, linesFit * metrics.charsPerLine));
                    }

                    if (splitLocal <= 0 || splitLocal >= rest.length) {
                      pushPage();
                      continued = start > 0;
                      continue;
                    }

                    const firstPartText = rest.substring(0, splitLocal);
                    curPage.push({bi, part:'filmSlice', start, end:start + splitLocal, continued, editable:true, sliceIx});
                    runH += getBlockMetrics(block, firstPartText, continued).blockH;
                    pushPage();

                    const rawRest = rest.substring(splitLocal);
                    rest = rawRest.replace(/^\s+/, "");
                    start = fullText.length - rest.length;
                    continued = true;
                    sliceIx += 1;
                  }
                  return;
                }

                if (pageBreaks.has(bi) && curPage.length > 0) {
                  const split = pageBreaks.get(bi);
                  if (split > 0) {
                    const firstText = (block.text || "").substring(0, split);
                    const secondText = ((block.text || "").substring(split)).trimStart();
                    curPage.push({bi, part:'first', split});
                    runH += getBlockMetrics(block, firstText, false).blockH;
                    pushPage();
                    curPage.push({bi, part:'second', split});
                    runH += getBlockMetrics(block, secondText, false).blockH;
                  } else {
                    pushPage();
                    curPage.push({bi, part:'full', split:-1});
                    runH += getBlockMetrics(block, block.text || "", false).blockH;
                  }
                } else {
                  curPage.push({bi, part:'full', split:-1});
                  runH += getBlockMetrics(block, block.text || "", false).blockH;
                }
              });
              if (curPage.length > 0) pages.push(curPage);
              const filmPad = "48px 96px 48px 96px";
              const playPad = "48px 72px";
              const otherPad = "48px 72px";
              const pagePad = mode==="play" ? playPad : (mode==="short"||mode==="media") ? otherPad : filmPad;

              let pageNum = 1;
              return pages.map((pageBlocks, pageIdx) => {
                const isFirstPage = pageIdx === 0;
                if (!isFirstPage) pageNum++;
                const currentPageNum = pageNum;

                return (
                  <React.Fragment key={pageIdx}>
                  {/* Страница */}
                  <div style={{
                    background:BG,
                    boxShadow:"8px 8px 24px rgba(0,0,0,0.16)",
                    marginBottom:"24px",
                    position:"relative",
                    minHeight:"1123px",
                    padding: pagePad,
                    boxSizing:"border-box",
                  }}>
                  {/* Номер страницы */}
                  {!isFirstPage && (
                    <div style={{
                      position:"absolute", top:"24px", right:"24px",
                      fontFamily:"'Courier New',monospace", fontSize:"14px",
                      color:T2,
                    }}>{currentPageNum}.</div>
                  )}
                  {pageBlocks.map((entry) => {
              const { bi, part, split, start=0, end=null, continued=false, editable=true, sliceIx=0 } = entry;
              const block = blocks[bi];
              const isFilmSlice = part === 'filmSlice';
              const blockText = block.text || "";
              const secondRawText = part==='second' ? blockText.substring(split) : "";
              const secondTrimLead = part==='second' ? (secondRawText.length - secondRawText.replace(/^\s+/, "").length) : 0;
              const sliceStartAbs = isFilmSlice
                                ? start
                                : part==='first' ? 0
                                : part==='second' ? (split + secondTrimLead)
                                : 0;
              const sliceEndAbs = isFilmSlice
                                ? (end ?? blockText.length)
                                : part==='first' ? split
                                : part==='second' ? blockText.length
                                : blockText.length;
              const canEditFilmSlice = mode === "film" && (isFilmSlice || part==='first' || part==='second');
              // Текст с учётом разбивки
              const displayText = isFilmSlice
                                ? blockText.substring(start, end ?? blockText.length)
                                : part==='first' ? blockText.substring(0, split)
                                : part==='second' ? secondRawText.trimStart()
                                : blockText;
              const def = defs.find(d => d.type===block.type) || defs[3];
              const focused = focId === block.id;
              const isAct   = block.type === "act";
              const isScene = block.type === "scene";
              const isCast  = block.type === "cast";
              const isHead  = isAct || isScene;
              const num = isHead ? sceneNum(block.id) : null;
              const isPageBreak = false;
              const charSplit = -1;
              const isFirstPart = isFilmSlice ? !editable : part==='first';
              const textareaReadOnly = canEditFilmSlice ? false : isFirstPart;
              const isContinuedFilmSlice = isFilmSlice && continued;

              // Определяем контекст для разрыва страницы
              const prevBlock = bi > 0 ? blocks[bi-1] : null;
              const nextBlock = bi < blocks.length-1 ? blocks[bi+1] : null;
              const isDialogueBreak = false;
              let charName = "";
              if (block.type === "dialogue" && (part === "first" || part === "second")) {
                for (let i = bi - 1; i >= 0; i--) {
                  if (blocks[i].type === "char") { charName = (blocks[i].text || "").toUpperCase(); break; }
                  if (blocks[i].type === "scene" || blocks[i].type === "act") break;
                }
              }

              return (
                <React.Fragment key={isFilmSlice ? `${block.id}-filmSlice-${sliceIx}` : `${block.id}-${part}`}>
                {/* page break divider removed - handled by page containers */}
                {mode === "film" && block.type === "dialogue" && part === "second" && charName && (
                  <div style={{
                    fontFamily:"'Courier New',Courier,monospace",
                    fontSize:"14px", lineHeight:"1.5",
                    color:"#e8e4d8",
                    textTransform:"uppercase",
                    paddingLeft:"211px",
                    paddingTop:"18px",
                    paddingBottom:"0",
                  }}>{charName} (ПРОД.)</div>
                )}
                <div
                  ref={el => { if (isHead) sceneRefs.current[block.id] = el; }}
                  style={{position:"relative", display:"flex", alignItems:"center"}}
                >

                  {/* Left gutter */}
                  <div style={{
                    position:"absolute", left:"-148px", top: (()=>{
                    let pt = 5;
                    if (isContinuedFilmSlice) pt = 0;
                    else if(def.st?.paddingTop !== undefined) pt = parseInt(def.st.paddingTop)||0;
                    else if(def.st?.padding !== undefined) pt = parseInt(def.st.padding)||0;
                    const mt = parseInt(def.st?.marginTop)||0;
                    const fs = parseFloat(def.st?.fontSize)||(mode==="play"?15:14);
                    const lh = parseFloat(def.st?.lineHeight)||(mode==="play"?1.7:1.85);
                    return `${mt + pt + Math.round(fs*lh/2)}px`;
                  })(), transform:"translateY(-50%)",
                    width:"140px", display:"flex", alignItems:"center",
                    justifyContent:"flex-end",
                    opacity: focused ? 1 : (isHead||(block.type==="video"||block.type==="segment") ? 0.6 :
                      (mode==="media"&&["anchor","sync","vtr","offscreen","lower3","question","note"].includes(block.type)) ||
                      (mode==="short"&&["hook","body","cta","action"].includes(block.type)) ? 0.4 : 0),
                    transition:"opacity .15s",
                    pointerEvents: focused || isHead||(block.type==="video"||block.type==="segment") ||
                      (mode==="media"&&["anchor","sync","vtr","offscreen","lower3","question","note"].includes(block.type)) ||
                      (mode==="short"&&["hook","body","cta","action"].includes(block.type)) ? "auto" : "none",
                  }}>
                    {isHead && (
                      <>
                        {/* Чекбокс — всегда виден для scene/act */}
                        <div
                          onMouseDown={e=>e.preventDefault()}
                          onClick={()=>setSelectedScenes(prev=>{const next=new Set(prev);next.has(block.id)?next.delete(block.id):next.add(block.id);return next;})}
                          style={{
                            width:"16px",height:"16px",borderRadius:"5px",flexShrink:0,
                            border:`2px solid ${selectedScenes.has(block.id)?mc:T3+"99"}`,
                            background:selectedScenes.has(block.id)?mc:T3+"22",
                            cursor:"pointer",marginRight:"4px",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            transition:"all .08s",
                          }}>
                          {selectedScenes.has(block.id)&&<span style={{color:"#000",fontSize:"9px",fontWeight:"bold",lineHeight:1}}>✓</span>}
                        </div>
                        <span style={{color: isAct ? ACCENT : mc, fontSize:"12px", fontWeight:"bold", marginRight:"5px"}}>{num}.</span>
                        <button onMouseDown={e=>{e.preventDefault(); dupScene(block.id);}} style={{width:"20px",height:"20px",borderRadius:"6px",background:`${mc}15`,border:`1px solid ${mc}44`,color:mc,fontSize:"11px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginRight:"3px"}}>⧉</button>
                        <button onMouseDown={e=>{e.preventDefault(); delScene(block.id);}} style={{width:"20px",height:"20px",borderRadius:"6px",background:"#f8717115",border:"1px solid #f8717140",color:"#f87171",fontSize:"11px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="1" x2="7" y2="7"/><line x1="7" y1="1" x2="1" y2="7"/></svg></button>
                      </>
                    )}
                    {/* Чекбокс для video/segment (не isHead но selectables) */}
                    {!isHead && (block.type==="video"||block.type==="segment") && (
                      <div
                        onMouseDown={e=>e.preventDefault()}
                        onClick={()=>setSelectedScenes(prev=>{const next=new Set(prev);next.has(block.id)?next.delete(block.id):next.add(block.id);return next;})}
                        style={{
                          width:"16px",height:"16px",borderRadius:"5px",flexShrink:0,
                          border:`2px solid ${selectedScenes.has(block.id)?mc:T3+"99"}`,
                          background:selectedScenes.has(block.id)?mc:T3+"22",
                          cursor:"pointer",marginRight:"4px",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          transition:"all .08s",
                        }}>
                        {selectedScenes.has(block.id)&&<span style={{color:"#000",fontSize:"9px",fontWeight:"bold",lineHeight:1}}>✓</span>}
                      </div>
                    )}
                    {!isHead && !isCast && (
                      <>
                        {/* Чекбокс для блоков-сцен в видео/медиа режимах */}
                        {(mode==="media"&&["anchor","sync","vtr","offscreen","lower3","question","note"].includes(block.type)) ||
                         (mode==="short"&&["hook","body","cta","action"].includes(block.type)) ? (
                          <div
                            onMouseDown={e=>e.preventDefault()}
                            onClick={()=>setSelectedScenes(prev=>{const next=new Set(prev);next.has(block.id)?next.delete(block.id):next.add(block.id);return next;})}
                            style={{
                              width:"16px",height:"16px",borderRadius:"5px",flexShrink:0,
                              border:`2px solid ${selectedScenes.has(block.id)?mc:T3+"99"}`,
                              background:selectedScenes.has(block.id)?mc:T3+"22",
                              cursor:"pointer",marginRight:"4px",
                              display:"flex",alignItems:"center",justifyContent:"center",
                              transition:"all .08s",
                            }}>
                            {selectedScenes.has(block.id)&&<span style={{color:"#000",fontSize:"9px",fontWeight:"bold",lineHeight:1}}>✓</span>}
                          </div>
                        ) : null}
                        <span className="gutter-label" style={{fontSize:"9px", color:T3, letterSpacing:"1px", whiteSpace:"nowrap", marginRight:"5px"}}>{def.hotkey} {def.label.toUpperCase().substring(0,10)}</span>
                        <button onMouseDown={e=>{e.preventDefault();setTypeMenu(typeMenu===block.id?null:block.id);}} style={{width:"20px",height:"20px",borderRadius:"50%",background:SURF,boxShadow:typeMenu===block.id?SH_IN:SH_SM,border:"none",color:T2,fontSize:"13px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .08s",marginRight:"3px"}}>+</button>
                        <button onMouseDown={e=>{e.preventDefault();const nb={...block,id:uid()};setBlocks(bs=>{const i=bs.findIndex(b=>b.id===block.id);const a=[...bs];a.splice(i+1,0,nb);return a;});markDirty();}} style={{width:"20px",height:"20px",borderRadius:"6px",background:`${mc}15`,border:`1px solid ${mc}44`,color:mc,fontSize:"11px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginRight:"3px"}}>⧉</button>
                        <button onMouseDown={e=>{e.preventDefault(); delBlock(block.id);}} style={{width:"20px",height:"20px",borderRadius:"6px",background:"#f8717115",border:"1px solid #f8717140",color:"#f87171",fontSize:"11px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="1" x2="7" y2="7"/><line x1="7" y1="1" x2="1" y2="7"/></svg></button>
                      </>
                    )}
                  </div>
                  {/* Right buttons — показываем при фокусе */}

                  {/* Type popup */}
                  {typeMenu===block.id && !isHead && !isCast && (
                    <div style={{
                      position:"absolute", left:"-148px", top:"28px", zIndex:400,
                      background: SURF,
                      boxShadow: "10px 10px 28px rgba(0,0,0,0.65), -5px -5px 14px rgba(255,255,255,0.028)",
                      borderRadius:"14px", padding:"8px", width:"220px",
                    }}>
                      <div style={{fontSize:"9px",color:T3,letterSpacing:"2px",padding:"4px 8px 8px"}}>ИЗМЕНИТЬ ТИП</div>
                      {defs.filter(d=>d.type!=="scene"&&d.type!=="cast"&&d.type!=="act").map(d=>(
                        <button key={d.type} onMouseDown={e=>{e.preventDefault();chType(block.id,d.type);}} style={{
                          display:"flex", alignItems:"center", width:"100%",
                          padding:"6px 10px",
                          background: block.type===d.type ? BG : "transparent",
                          boxShadow: block.type===d.type ? SH_IN : "none",
                          border:"none",
                          borderRadius:"8px",
                          color: block.type===d.type ? T1 : T2,
                          fontSize:"11px", cursor:"pointer",
                          textAlign:"left", fontFamily:"inherit",
                          letterSpacing:"0.5px", transition:"all .12s",
                          marginBottom:"2px",
                        }}>
                          <span style={{color: block.type===d.type ? mc : T3, minWidth:"12px"}}>{d.hotkey}</span>
                          {d.label}
                        </button>
                      ))}
                      <div style={{borderTop:`1px solid ${T3}22`, marginTop:"6px", paddingTop:"6px"}}>
                        <div style={{fontSize:"9px",color:T3,letterSpacing:"2px",padding:"2px 8px 6px"}}>ДОБАВИТЬ ПОСЛЕ</div>
                        {defs.filter(d=>d.type!=="scene"&&d.type!=="act").map(d=>(
                          <button key={d.type} onMouseDown={e=>{e.preventDefault();addAfter(block.id,d.type);}} style={{
                            display:"flex", alignItems:"center", width:"100%",
                            padding:"5px 10px", background:"transparent", border:"none",
                            borderRadius:"6px", color:T3, fontSize:"10px",
                            cursor:"pointer", textAlign:"left", fontFamily:"inherit",
                          }}>
                            <span style={{color:T3}}>{d.hotkey}</span>+ {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Divider before act/scene */}
                  {isHead && (
                    <div style={{
                      position:"absolute", top:"-16px", left:"-160px", right:"0",
                      height:"1px", opacity:0.001,
                      background:`linear-gradient(to right, transparent, ${T3}44, transparent)`,
                    }}/>
                  )}

                  {/* PLAY LINE — inline name + text */}
                  {mode==="play" && block.type==="line" ? (
                    <div style={{
                      flex:1, display:"flex", alignItems:"flex-start",
                      paddingTop:"4px", paddingBottom:"0",
                      fontFamily:"'Times New Roman',Times,serif",
                      fontSize:"15px", lineHeight:"1.7",
                    }}>
                      <input
                        value={block.name||""}
                        onChange={e=>updBlockName(block.id, e.target.value)}
                        onFocus={()=>setFocId(block.id)}
                        onBlur={()=>setTimeout(()=>setFocId(f=>f===block.id?null:f),250)}
                        onKeyDown={e=>{
                          if(e.key==="Tab"||e.key==="Enter"){e.preventDefault();blockRefs.current[block.id]?.focus();}
                        }}
                        placeholder="Имя"
                        spellCheck={false}
                        size={Math.max(3,(block.name||"").length+1)}
                        style={{
                          background:"transparent", border:"none", outline:"none",
                          fontWeight:"bold", color:block.color || T1,
                          fontFamily:"'Times New Roman',Times,serif",
                          fontSize:"15px", lineHeight:"1.7",
                          flexShrink:0, padding:"0", margin:"0", minWidth:"30px",
                        }}
                      />
                      <span style={{
                        color:block.color || T1, fontWeight:"bold",
                        fontFamily:"'Times New Roman',Times,serif",
                        fontSize:"15px", marginRight:"7px", flexShrink:0, lineHeight:"1.7",
                      }}>.</span>
                      <textarea
                        ref={el=>{ if (!textareaReadOnly) blockRefs.current[block.id]=el; if(el) { el.dataset.sliceStart = String(sliceStartAbs); el.dataset.blockId = String(block.id); autoH(el); } }}
                        value={displayText}
                        onChange={e=>{if(!textareaReadOnly){
                          if (canEditFilmSlice) {
                            filmEditStateRef.current = {
                              blockId: block.id,
                              absStart: sliceStartAbs + (e.target.selectionStart ?? e.target.value.length),
                              absEnd: sliceStartAbs + (e.target.selectionEnd ?? e.target.value.length),
                              scrollTop: scrollRef.current ? scrollRef.current.scrollTop : null,
                              sliceStart: sliceStartAbs,
                            };
                            const prefix = blockText.substring(0, sliceStartAbs);
                            const suffix = sliceEndAbs != null ? blockText.substring(sliceEndAbs) : "";
                            updBlock(block.id, prefix + e.target.value + suffix);
                            autoH(e.target);
                            return;
                          }
                          const prefix = part==='second' ? block.text.substring(0, split) : '';
                          updBlock(block.id, prefix + e.target.value);
                          autoH(e.target);
                        }}}
                        readOnly={textareaReadOnly}
                        onFocus={e=>{ if(!textareaReadOnly) { blockRefs.current[block.id] = e.target; setFocId(block.id); } }}
                        onBlur={()=>setTimeout(()=>setFocId(f=>f===block.id?null:f),250)}
                        onKeyDown={e=>{ if(!textareaReadOnly) onKey(e,block,{ part, isFilmSlice, continued, sliceStartAbs, sliceEndAbs }); }}
                        placeholder="текст реплики..."
                        spellCheck={spellOn} rows={1}
                        style={{
                          flex:1, background:"transparent", border:"none", outline:"none",
                          resize:"none", overflow:"hidden",
                          color:block.color || T1, fontSize:"15px", lineHeight:"1.7",
                          fontFamily:"'Times New Roman',Times,serif",
                          boxSizing:"border-box", padding:"0", margin:"0",
                        }}
                      />
                    </div>
                  ) : (
                  /* STANDARD BLOCK */
                  <textarea
                    ref={el=>{
                      if (!textareaReadOnly) blockRefs.current[block.id]=el;
                      if (el) { el.dataset.sliceStart = String(sliceStartAbs); el.dataset.blockId = String(block.id); autoH(el); }
                    }}
                    value={displayText}
                    onChange={e=>{
                      if (canEditFilmSlice) {
                        filmEditStateRef.current = {
                          blockId: block.id,
                          absStart: sliceStartAbs + (e.target.selectionStart ?? e.target.value.length),
                          absEnd: sliceStartAbs + (e.target.selectionEnd ?? e.target.value.length),
                          scrollTop: scrollRef.current ? scrollRef.current.scrollTop : null,
                          sliceStart: sliceStartAbs,
                        };
                        const prefix = blockText.substring(0, sliceStartAbs);
                        const suffix = sliceEndAbs != null ? blockText.substring(sliceEndAbs) : "";
                        updBlock(block.id, prefix + e.target.value + suffix);
                        autoH(e.target);
                        return;
                      }
                      if(!textareaReadOnly){
                        const prefix = part==='second' ? blockText.substring(0, split) : '';
                        updBlock(block.id, prefix + e.target.value);
                        autoH(e.target);
                      }
                    }}
                    readOnly={textareaReadOnly}
                    onFocus={e=>{ if(!textareaReadOnly) { blockRefs.current[block.id] = e.target; setFocId(block.id); } }}
                    onBlur={()=>setTimeout(()=>setFocId(f=>f===block.id?null:f),250)}
                    onKeyDown={e=>{ if(!textareaReadOnly) onKey(e,block,{ part, isFilmSlice, continued, sliceStartAbs, sliceEndAbs }); }}
                    placeholder={def.ph}
                    spellCheck={spellOn && def.spell} rows={1}
                    style={{
                      flex:1, background:"transparent", border:"none", outline:"none",
                      resize:"none", overflow:"hidden",
                      fontSize: mode==="play" ? "15px" : "14px",
                      lineHeight: mode==="play" ? "1.7" : "1.85",
                      fontFamily: mode==="play"
                        ? "'Times New Roman',Times,serif"
                        : "'Courier New',Courier,monospace",
                      ...def.st,
                      ...(isContinuedFilmSlice ? { paddingTop:"0" } : {}),
                      fontWeight: block.bold ? "bold" : block.semibold ? "600" : (def.st?.fontWeight),
                      fontStyle: block.italic ? "italic" : (def.st?.fontStyle),
                      textDecoration: block.underline ? "underline" : (def.st?.textDecoration),
                      color: block.color || def.st?.color || "#e8e4d8",
                    }}
                  />
                  )}
                </div>
                {mode === "film" && block.type === "dialogue" && part === "first" && (
                  <div style={{
                    fontFamily:"'Courier New',Courier,monospace",
                    fontSize:"14px", lineHeight:"1.5",
                    color:"#e8e4d8",
                    paddingLeft:"211px",
                    paddingTop:"4px",
                  }}>(ДАЛЬШЕ)</div>
                )}
                </React.Fragment>
              );
            })}
                  </div>{/* end page container */}

                  </React.Fragment>
                );
              });
            })()}

            {/* Bottom add buttons moved to fixed bar above bottom hint */}
          </div>
          </div>
        </div>

        {/* Fixed add buttons bar above bottom hint */}
        {mode!=="note" && <div style={{
          flexShrink:0,
          padding:"10px 12px 8px",
          background:BG,
          borderTop:`1px solid ${SURF}`,
        }}>
          <div style={{display:"flex", flexWrap:"wrap", gap:"8px"}}>
            {mode==="play" && (()=>{
              const actDef = defs.find(d=>d.type==="act");
              if (!actDef) return null;
              return (
                <button key={actDef.type} onMouseDown={e=>e.preventDefault()} onClick={()=>{
                  if (focId) {
                    addAfter(focId, actDef.type);
                  } else {
                    const last=blocks[blocks.length-1];
                    if(last) addAfter(last.id,actDef.type);
                  }
                }} style={{
                  padding:"6px 14px",
                  background: SURF, boxShadow: SH_SM,
                  border:"none", borderRadius:"14px",
                  color:T2, fontSize:"10px", cursor:"pointer",
                  fontFamily:"inherit", letterSpacing:"1px",
                  transition:"all .2s",
                  whiteSpace:"nowrap",
                }}>
                  {actDef.hotkey} {actDef.label}
                </button>
              );
            })()}
            {defs.filter(d=>d.type!=="act").map(d=>(
              <button key={d.type} onMouseDown={e=>e.preventDefault()} onClick={()=>{
                if (focId) {
                  const cur = blocks.find(b=>b.id===focId);
                  if (cur && !["scene","act"].includes(cur.type)) { chType(focId, d.type); return; }
                  addAfter(focId, d.type);
                } else {
                  const last=blocks[blocks.length-1];
                  if(last) addAfter(last.id,d.type);
                }
              }} style={{
                padding:"6px 14px",
                background: SURF, boxShadow: SH_SM,
                border:"none", borderRadius:"14px",
                color:T2, fontSize:"10px", cursor:"pointer",
                fontFamily:"inherit", letterSpacing:"1px",
                transition:"all .2s",
                whiteSpace:"nowrap",
              }}>
                {d.hotkey} {d.label}
              </button>
            ))}
          </div>
        </div>}

        {/* Bottom hint bar */}
        <div style={{
          background: SURF, boxShadow:"0 -2px 12px rgba(0,0,0,0.3)",
          padding:"6px 12px", display:"flex",
          flexShrink:0, alignItems:"center", flexWrap:"wrap",
          minHeight:"36px",
        }}>
          <span style={{fontSize:"9px",color:T3,letterSpacing:"1px",flexShrink:1,overflow:"hidden",whiteSpace:"nowrap",minWidth:0,marginRight:"12px"}}>TAB — тип</span>
          <span style={{fontSize:"9px",color:T3,letterSpacing:"1px",flexShrink:1,overflow:"hidden",whiteSpace:"nowrap",minWidth:0}}>ENTER — блок</span>
          <div style={{flex:1, minWidth:"4px"}}/>
          {(mode==="film"||mode==="play"||mode==="media"||mode==="short") && (
            <div style={{display:"flex", alignItems:"center", flexShrink:0, marginRight:"6px"}}>
              {/* Форматирование текущего блока */}
              {(() => {
                const activeId = getActiveBlockId();
                const curBlock = activeId ? blocks.find(b=>b.id===activeId) : null;
                const toggle = (field) => {
                  if(!activeId) return;
                  setBlocks(bs=>bs.map(b=>b.id===activeId?{...b,[field]:!b[field]}:b));
                  markDirty();
                };
                const setColor = (color) => {
                  if(!activeId) return;
                  setBlocks(bs=>bs.map(b=>b.id===activeId?{...b,color,_colorOpen:false}:b));
                  markDirty();
                };
                const btnStyle = (active, col) => ({
                  width:"28px", height:"28px",
                  background: active ? `${mc}22` : BG,
                  boxShadow: SH_SM,
                  border:`1px solid ${active ? mc : mc+"33"}`,
                  borderRadius:"8px",
                  color: active ? mc : T2,
                  fontSize:"12px", cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  marginRight:"3px", WebkitAppearance:"none",
                  ...(col ? {color: col} : {}),
                });
                const COLORS = ["#e8e4d8","#f472b6","#60a5fa","#4ade80","#fbbf24","#a78bfa","#f87171","#34d399"];
                const fmtCfg = getFormatConfig(mode);
                return (
                  <div style={{display:"flex", alignItems:"center", marginRight:"6px"}}>
                    {fmtCfg.bold && <button onMouseDown={e=>e.preventDefault()} onClick={()=>toggle("bold")}
                      style={{...btnStyle(curBlock?.bold), fontWeight:"bold", fontFamily:"serif"}}>Ж</button>}
                    <button onMouseDown={e=>e.preventDefault()} onClick={()=>{if(!activeId)return;setBlocks(bs=>bs.map(b=>b.id===activeId?{...b,bold:false,italic:false,underline:false,semibold:false,color:null,_colorOpen:false}:b));markDirty();}}
                      style={{...btnStyle(false)}}>Н</button>
                    {fmtCfg.italic && <button onMouseDown={e=>e.preventDefault()} onClick={()=>toggle("italic")}
                      style={{...btnStyle(curBlock?.italic), fontStyle:"italic", fontFamily:"serif"}}>К</button>}
                    {fmtCfg.underline && <button onMouseDown={e=>e.preventDefault()} onClick={()=>toggle("underline")}
                      style={{...btnStyle(curBlock?.underline), textDecoration:"underline"}}>Ч</button>}
                    {/* Цвет */}
                    <div style={{position:"relative"}}>
                      <button onMouseDown={e=>e.preventDefault()} onClick={()=>{ if(!activeId) return; setBlocks(bs=>bs.map(b=>b.id===activeId?{...b,_colorOpen:!b._colorOpen}:b)); }}
                        style={{...btnStyle(false), background: curBlock?.color && curBlock.color!=="inherit" ? curBlock.color+"22" : BG, border:`2px solid ${curBlock?.color||mc+"33"}`, marginRight:0}}>
                        <div style={{width:"10px",height:"10px",borderRadius:"50%",background:curBlock?.color||T2}}/>
                      </button>
                      {curBlock?._colorOpen && (
                        <div style={{position:"absolute",bottom:"34px",right:0,background:SURF,borderRadius:"12px",
                          boxShadow:"0 8px 24px rgba(0,0,0,0.5)",padding:"8px",zIndex:100,
                          display:"flex", flexWrap:"wrap", width:"100px"}}>
                          {COLORS.map(c=>(
                            <button key={c} onMouseDown={e=>e.preventDefault()}
                              onClick={()=>{ if(!activeId) return; setColor(c); }}
                              style={{width:"20px",height:"20px",borderRadius:"50%",background:c,
                                border: curBlock?.color===c ? "2px solid #fff" : "2px solid transparent",
                                cursor:"pointer",marginRight:"4px",marginBottom:"4px",WebkitAppearance:"none"}}/>
                          ))}
                          <button onMouseDown={e=>e.preventDefault()}
                            onClick={()=>{ if(!activeId) return; setColor(null); }}
                            style={{width:"20px",height:"20px",borderRadius:"50%",background:"transparent",
                              border:"1px dashed "+T3,cursor:"pointer",fontSize:"10px",color:T3,
                              display:"flex",alignItems:"center",justifyContent:"center",WebkitAppearance:"none"}}>✕</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              {/* Аа — шрифт */}
              <div style={{position:"relative"}}>
                <button onMouseDown={e=>e.preventDefault()} onClick={()=>setDocFontOpen(o=>!o)}
                  style={{padding:"4px 10px",background:BG,boxShadow:SH_SM,border:`1px solid ${mc}44`,borderRadius:"8px",
                    color:mc,fontSize:"10px",cursor:"pointer",fontFamily:"inherit",letterSpacing:"1px",WebkitAppearance:"none"}}>Аа</button>
                {docFontOpen && (
                  <div style={{position:"absolute",bottom:"32px",right:0,background:SURF,
                    borderRadius:"12px",boxShadow:"0 8px 24px rgba(0,0,0,0.4)",
                    padding:"6px",zIndex:50,minWidth:"160px"}}>
                    {["Times New Roman","Georgia","Palatino","Courier New","Arial","Helvetica"].map(f=>(
                      <button key={f} onMouseDown={e=>e.preventDefault()}
                        onClick={()=>{setDocFont(f);setDocFontOpen(false);}}
                        style={{display:"block",width:"100%",padding:"8px 12px",
                          border:"none",borderRadius:"8px",textAlign:"left",cursor:"pointer",
                          fontFamily:f,fontSize:"13px",
                          color:docFont===f?mc:T1,
                          background:docFont===f?`${mc}15`:"transparent",
                        }}>{f}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <button onMouseDown={e=>e.preventDefault()} onClick={()=>setSpellOn(v=>!v)}
            style={{padding:"4px 10px",background:spellOn?`${mc}22`:BG,boxShadow:SH_SM,
              border:`1px solid ${spellOn?mc:mc+"44"}`,borderRadius:"8px",
              color:spellOn?mc:mc+"77",fontSize:"10px",cursor:"pointer",
              fontFamily:"inherit",letterSpacing:"1px",position:"relative",flexShrink:0,
              marginRight:"6px",WebkitAppearance:"none"}}>
            АБВ{spellOn&&<span style={{position:"absolute",top:"-3px",right:"-3px",width:"6px",height:"6px",background:mc,borderRadius:"50%"}}/>}
          </button>
          <button onClick={showPreview} style={{
            padding:"4px 10px", flexShrink:0,
            background: mc+"22", boxShadow: SH_SM,
            border:`1px solid ${mc}66`, borderRadius:"8px",
            color: mc, fontSize:"10px", cursor:"pointer",
            fontFamily:"inherit", letterSpacing:"1px",
            whiteSpace:"nowrap",
          }}>⎙ ПЕЧАТЬ</button>
        </div>
      </div>

      {/* ══ DRAG HANDLE: RIGHT ══ */}
      <div
        onMouseDown={e=>{
          e.preventDefault();
          const startX=e.clientX, startW=rightW;
          const onMove=ev=>setRightW(Math.max(130,Math.min(300,startW-(ev.clientX-startX))));
          const onUp=()=>{window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseup",onUp);};
          window.addEventListener("mousemove",onMove);
          window.addEventListener("mouseup",onUp);
        }}
        style={{width:"4px",cursor:"ew-resize",background:"transparent",flexShrink:0,zIndex:10,
          transition:"background .15s"}}
        onMouseEnter={e=>e.currentTarget.style.background=`${ACCENT}55`}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
      />

      {/* ══ RIGHT PANEL ══ */}
      <div style={{
        width:`${rightW}px`, minWidth:`${rightW}px`,
        background: SURF,
        boxShadow: "-4px 0 20px rgba(0,0,0,0.4)",
        display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0,
      }}>

        {/* Prev */}
        <button onClick={()=>{
          if (!focId) return;
          const i = blocks.findIndex(b=>b.id===focId);
          if (i > 0) blockRefs.current[blocks[i-1].id]?.focus();
        }} style={{
          padding:"12px 14px",
          background:"transparent", border:"none",
          borderBottom:`1px solid ${T3}22`,
          color:T2, fontSize:"11px", cursor:"pointer",
          fontFamily:"inherit", textAlign:"left",
          display:"flex", alignItems:"center",
          transition:"all .08s",
        }}>
          <span style={{color:T3}}>↑</span> Предыдущий
        </button>

        {/* Block type buttons */}
        <div style={{flex:1, overflow:"auto", padding:"6px"}}>
          {(() => {
            const curBlock = focId ? blocks.find(b=>b.id===focId) : null;
            const curType = curBlock?.type;
            const PROTECTED = ["scene","act"];
            // Which buttons to show
            const panelDefs = defs.filter(d => d.type !== "act");
            return panelDefs.map((d) => {
              const isActive = curType === d.type;
              return (
                <button key={d.type} onClick={()=>{
                  if (!focId || !curBlock) return;
                  if (d.type === "cast" && curType === "scene") {
                    const i = blocks.findIndex(b=>b.id===focId);
                    const next = blocks[i+1];
                    if (next?.type === "cast") blockRefs.current[next.id]?.focus();
                    return;
                  }
                  if (curType === d.type) { addAfter(focId, d.type); }
                  else if (!PROTECTED.includes(curType)) { chType(focId, d.type); }
                }} style={{
                  display:"flex", alignItems:"center",
                  width:"100%", padding:"9px 10px", marginBottom:"4px",
                  background: isActive ? BG : "transparent",
                  boxShadow: isActive ? SH_IN : "none",
                  border:"none", borderRadius:"14px",
                  color: isActive ? T1 : T2,
                  fontSize:"11px", cursor:"pointer",
                  fontFamily:"inherit", textAlign:"left",
                  letterSpacing:"0.5px", transition:"all .08s",
                }}>
                  <span style={{color: isActive ? mc : T3, fontSize:"10px", minWidth:"12px", marginRight:"8px"}}>{d.hotkey}</span>
                  {d.type === "trans" ? "Монтаж" : d.label}
                </button>
              );
            });
          })()}
        </div>

        {/* Next */}
        <button onClick={()=>{
          if (!focId) return;
          const block = blocks.find(b=>b.id===focId);
          if (!block || !defs || defs.length === 0) return;
          const def = defs.find(d=>d.type===block.type) || defs[0];
          addAfter(focId, def.next || defs[0].type);
        }} style={{
          padding:"12px 14px",
          background:"transparent", border:"none",
          borderTop:`1px solid ${T3}22`,
          color:T2, fontSize:"11px", cursor:"pointer",
          fontFamily:"inherit", textAlign:"left",
          display:"flex", alignItems:"center",
          transition:"all .08s",
        }}>
          <span style={{color:T3}}>↓</span> Следующий
        </button>
      </div>

      {/* ══ AI PANEL ══ */}
      {aiOpen && (
        <>
        <div
          onMouseDown={e=>{
            e.preventDefault();
            const startX=e.clientX, startW=aiW;
            const onMove=ev=>setAiW(Math.max(200,Math.min(590,startW-(ev.clientX-startX))));
            const onUp=()=>{window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseup",onUp);};
            window.addEventListener("mousemove",onMove);
            window.addEventListener("mouseup",onUp);
          }}
          style={{width:"4px",cursor:"ew-resize",background:"transparent",flexShrink:0,zIndex:10,
            transition:"background .15s"}}
          onMouseEnter={e=>e.currentTarget.style.background=`${ACCENT}55`}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}
        />
        <div style={{
          width:`${aiW}px`, minWidth:`${aiW}px`,
          background: SURF,
          boxShadow: "-4px 0 20px rgba(0,0,0,0.4)",
          display:"flex", flexDirection:"column", overflow:"hidden",
        }}>

          {/* Model selector */}
          <div style={{padding:"12px 10px 10px", borderBottom:`1px solid ${T3}22`, flexShrink:0}}>
            <div style={{fontSize:"9px",color:T3,letterSpacing:"2px",marginBottom:"10px"}}>ИИ МОДЕЛИ</div>
            {AIM.map(m=>(
              <button key={m.id} onClick={()=>setAiMod(m.id)} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                width:"100%", padding:"7px 10px", marginBottom:"4px",
                background: aiMod===m.id ? BG : "transparent",
                boxShadow: aiMod===m.id ? SH_IN : "none",
                border:"none", borderRadius:"10px",
                cursor:"pointer", fontFamily:"inherit",
                transition:"all .08s",
              }}>
                <div style={{display:"flex", alignItems:"center"}}>
                  <div style={{
                    width:"6px", height:"6px", borderRadius:"50%",
                    background:m.color,
                    boxShadow: aiMod===m.id ? `0 0 8px ${m.color}` : "none",
                    opacity: aiMod===m.id ? 1 : 0.25,
                    marginRight:"8px", flexShrink:0,
                  }}/>
                  <span style={{color:aiMod===m.id?T1:T2, fontSize:"11px", marginRight:"6px"}}>{m.label}</span>
                  <span style={{color:aiMod===m.id?m.color+"88":T3, fontSize:"10px"}}>{m.role}</span>
                </div>
                {m.free && <span style={{fontSize:"8px",color:"#4ade8066",border:`1px solid #4ade8022`,borderRadius:"4px",padding:"1px 5px",letterSpacing:"1px"}}>FREE</span>}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div style={{flex:1, overflow:"auto", padding:"10px", display:"flex", flexDirection:"column"}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", marginBottom:"12px"}}>
                <div style={{
                  maxWidth:"90%", padding:"9px 12px",
                  background: m.role==="user" ? BG : SURF,
                  boxShadow: SH_SM,
                  borderRadius:m.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",
                  borderLeft: m.role==="ai" ? `2px solid ${AIM.find(x=>x.id===m.model)?.color||T3}` : "none",
                  fontSize:"11px", lineHeight:"1.7",
                  color:m.role==="user"?T2:T1,
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {aiLoad && (
              <div style={{display:"flex", alignItems:"center"}}>
                <Whale size={20}/>
                <span style={{color:T3, fontSize:"10px", letterSpacing:"1px"}}>ДУМАЕТ...</span>
              </div>
            )}
            <div ref={msgEnd}/>
          </div>

          {/* Input */}
          <div style={{padding:"8px 10px 10px", borderTop:`1px solid ${T3}22`, flexShrink:0}}>
            <div
              onMouseDown={e=>{
                e.preventDefault();
                const startY = e.clientY;
                const startH = aiComposerH;
                const maxH = Math.floor((window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight) * 0.5);
                const onMove = ev=>setAiComposerH(Math.max(56, Math.min(maxH, startH - (ev.clientY - startY))));
                const onUp = ()=>{
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
              title="Тянуть вверх/вниз"
              style={{
                height:"14px",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                cursor:"ns-resize",
                userSelect:"none",
              }}
            >
              <div style={{
                width:"42px",
                height:"4px",
                borderRadius:"999px",
                background:`${T3}66`,
                boxShadow:"0 0 0 1px rgba(255,255,255,0.02)",
              }}/>
            </div>
            <div style={{
              display:"flex", alignItems:"flex-end", gap:"8px",
              height:`${aiComposerH}px`, minHeight:"56px", maxHeight:"50vh",
              background: BG, boxShadow: SH_IN,
              borderRadius:"12px", padding:"8px 12px",
            }}>
              <textarea
                value={aiIn}
                onChange={e=>setAiIn(e.target.value)}
                onKeyDown={e=>{
                  if(e.key==="Enter" && !e.shiftKey){
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder={`${AIM.find(m=>m.id===aiMod)?.label}...`}
                style={{
                  flex:1,
                  height:"100%",
                  minHeight:0,
                  background:"transparent",
                  border:"none",
                  outline:"none",
                  color:T1,
                  fontSize:"11px",
                  lineHeight:"1.5",
                  fontFamily:"inherit",
                  resize:"none",
                  overflowY:"auto",
                  boxSizing:"border-box",
                  cursor:"text",
                }}
              />
              <button onClick={send} style={{
                padding:"4px 10px",
                background: SURF, boxShadow: SH_SM,
                border:"none", borderRadius:"8px",
                color: mc, fontSize:"13px", cursor:"pointer",
                fontFamily:"inherit", transition:"all .08s",
                flexShrink:0,
              }}>→</button>
            </div>
            <div style={{marginTop:"5px",fontSize:"9px",color:T3,textAlign:"center",letterSpacing:"1px"}}>
              {AIM.find(m=>m.id===aiMod)?.free?"БЕСПЛАТНО":"≈ 12 КРЕДИТОВ"}
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

export { EditorScreen };
