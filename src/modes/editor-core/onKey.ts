/**
 * Block keyboard handler — lifted verbatim out of the god component.
 *
 * `createBlockKeyHandler(deps)` returns the `onKey(e, block, ctx)` handler used by
 * every block textarea/brick across all modes (film with page slices, play, short,
 * media, note). It is intentionally a thin factory over a dependency bag rather
 * than a hook: the shell already recreates `onKey` every render, so it calls this
 * with the current values each render — behaviour is identical to the previous
 * inline definition.
 *
 * Pure block transforms are imported directly; everything that touches component
 * state / refs / DOM helpers is passed in via `deps`.
 */
import {
  splitBlockText,
  findPrecedingCharName,
  insertBlocksAfter,
  nextEnterType,
  cycleBlockType,
  computeMergeJoiner,
  mergeAdjacentBlocks,
} from "./blocks";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BlockKeyDeps {
  defs: any[];
  blocks: any[];
  blocksRef: { current: any[] };
  blockRefs: { current: Record<string, any> };
  mode: string;
  uid: () => any;
  updBlock: (id: any, text: string) => void;
  updBlockName: (id: any, name: string) => void;
  applyBlocks: (next: any[]) => void;
  setFoc: (id: any) => void;
  addAfter: (id: any, type: string) => void;
  chType: (id: any, type: string) => void;
  delBlock: (id: any) => void;
  autoH: (el: any) => void;
  filmEditStateRef: { current: any };
  scrollRef: { current: any };
  restoreFilmTextareaFocus: (node: any, sel: { absStart: number; absEnd: number }) => void;
  changeFilmBlockTypeFromActiveLine: (id: any, type: string) => boolean;
}

export function createBlockKeyHandler(deps: BlockKeyDeps) {
  const {
    defs, blocks, blocksRef, blockRefs, mode, uid,
    updBlock, updBlockName, applyBlocks, setFoc, addAfter, chType, delBlock, autoH,
    filmEditStateRef, scrollRef, restoreFilmTextareaFocus, changeFilmBlockTypeFromActiveLine,
  } = deps;

  return (e: any, block: any, ctx: any = {}) => {
    if (!defs || defs.length === 0) return;
    const def = defs.find((d: any)=>d.type===block.type)||defs[0];
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
      e.preventDefault();
      const el = e.target || blockRefs.current[block.id];
      const cursor = el ? el.selectionStart : block.text.length;
      const absCursor = (ctx && typeof ctx.sliceStartAbs === "number") ? (ctx.sliceStartAbs + cursor) : cursor;
      if (block.type==="line" && !(el && absCursor > 0 && absCursor < block.text.length)) {
        addAfter(block.id, "line"); return;
      }
      if (el && absCursor > 0 && absCursor < block.text.length && block.type === "dialogue") {
        // Разделяем диалог: часть1 + новый char(то же имя) + новый dialogue(остаток)
        const { before, after } = splitBlockText(block.text, absCursor);
        // Ищем имя персонажа назад
        const charText = findPrecedingCharName(blocks, block.id);
        updBlock(block.id, before);
        const charId = uid();
        const dialId = uid();
        applyBlocks(insertBlocksAfter(blocksRef.current, block.id, [
          { id: charId, type: "char", text: charText },
          { id: dialId, type: "dialogue", text: after },
        ]));
        filmEditStateRef.current = {
          blockId: dialId,
          absStart: 0,
          absEnd: 0,
          scrollTop: scrollRef.current ? scrollRef.current.scrollTop : null,
          sliceStart: null,
        };
        setFoc(dialId);
      } else if (el && absCursor > 0 && absCursor < block.text.length && !["scene", "act", "spacer"].includes(block.type)) {
        const { before, after } = splitBlockText(block.text, absCursor);
        updBlock(block.id, before);
        const newId = uid();
        applyBlocks(insertBlocksAfter(blocksRef.current, block.id, [{ id: newId, type: block.type, text: after }]));
        filmEditStateRef.current = {
          blockId: newId,
          absStart: 0,
          absEnd: 0,
          scrollTop: scrollRef.current ? scrollRef.current.scrollTop : null,
          sliceStart: null,
        };
        setFoc(newId);
      } else {
        addAfter(block.id, nextEnterType(def, defs));
      }
      return;
    }
    if (e.key==="Tab") {
      e.preventDefault();
      const nextType = cycleBlockType(defs, block.type, ["scene","line","act"]);
      if (nextType) {
        if (mode === "film" && changeFilmBlockTypeFromActiveLine(block.id, nextType)) return;
        chType(block.id, nextType);
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
            .map((node: any) => ({ node, sliceStart: parseInt(node.dataset.sliceStart || "0", 10) || 0 }))
            .filter((x: any) => x.node !== el && String(x.node.dataset.blockId || "") === String(block.id) && x.sliceStart < currentSliceStart)
            .sort((a: any,b: any) => b.sliceStart - a.sliceStart)[0];
          if (prevEntry && prevEntry.node) {
            const absPos = prevEntry.sliceStart + prevEntry.node.value.length;
            restoreFilmTextareaFocus(prevEntry.node, { absStart: absPos, absEnd: absPos });
          }
          return;
        }
        const currentBlocks = blocksRef.current || blocks;
        const bi = currentBlocks.findIndex((b: any) => b.id === block.id);
        if (mode === "film" && bi > 0 && block.type !== "act") {
          const prev = currentBlocks[bi - 1];
          if (prev && prev.type && prev.type !== "act") {
            e.preventDefault();
            if (isBlankBlock) {
              filmEditStateRef.current = {
                blockId: prev.id,
                absStart: (prev.text || "").length,
                absEnd: (prev.text || "").length,
                scrollTop: scrollRef.current ? scrollRef.current.scrollTop : null,
                sliceStart: null,
              };
              delBlock(block.id);
              return;
            }
            if (prev.type !== block.type) {
              filmEditStateRef.current = {
                blockId: block.id,
                absStart: 0,
                absEnd: 0,
                scrollTop: scrollRef.current ? scrollRef.current.scrollTop : null,
                sliceStart: null,
              };
              chType(block.id, prev.type);
              return;
            }
            const { joiner, caretPos } = computeMergeJoiner(prev.text, block.text);
            filmEditStateRef.current = {
              blockId: prev.id,
              absStart: caretPos,
              absEnd: caretPos,
              scrollTop: scrollRef.current ? scrollRef.current.scrollTop : null,
              sliceStart: null,
            };
            applyBlocks(mergeAdjacentBlocks(blocksRef.current, prev.id, block.id, joiner));
            return;
          }
        }
        if (mode === "play" && bi > 0 && block.type !== "act") {
          if (block.type === "line") {
            const nameText = block.name || "";
            const rowEl = el && el.parentElement ? el.parentElement : null;
            const nameInput = rowEl ? rowEl.querySelector('input') : null;
            e.preventDefault();
            if (nameText.length > 0) {
              updBlockName(block.id, nameText.slice(0, -1));
            }
            setTimeout(() => {
              if (!nameInput) return;
              try { nameInput.focus({ preventScroll: true }); } catch(err) { nameInput.focus(); }
              const pos = Math.max(0, nameText.length - 1);
              try { nameInput.setSelectionRange(pos, pos); } catch(err) {}
            }, 0);
            return;
          }
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
            const { joiner, caretPos } = computeMergeJoiner(prev.text, block.text);
            applyBlocks(mergeAdjacentBlocks(blocksRef.current, prev.id, block.id, joiner));
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
        if (mode === "short" && bi > 0 && block.type !== "act") {
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
            const { joiner, caretPos } = computeMergeJoiner(prev.text, block.text);
            applyBlocks(mergeAdjacentBlocks(blocksRef.current, prev.id, block.id, joiner));
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
        if (mode === "media" && bi > 0 && block.type !== "act") {
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
            const { joiner, caretPos } = computeMergeJoiner(prev.text, block.text);
            applyBlocks(mergeAdjacentBlocks(blocksRef.current, prev.id, block.id, joiner));
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
      const target = defs.find((d: any)=>d.hotkey===e.key);
      if (target && !["scene","act"].includes(block.type)) {
        e.preventDefault();
        if (mode === "film" && changeFilmBlockTypeFromActiveLine(block.id, target.type)) return;
        chType(block.id, target.type);
      }
    }
  };
}
