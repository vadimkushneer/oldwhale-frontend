// @ts-nocheck
import React from "react";
import { PlayHeaderEditor } from "../PlayHeader";
import {
  NOTE_ALIGN_OPTIONS,
  NOTE_COLORS,
  NOTE_TOOLBAR_ITEMS,
  buildBlockRowVars,
  buildPlayLineOverlayStyle,
  buildStandardBlockOverlayStyle,
  cx,
  useEditorDocument,
} from "./useEditorDocument";
import "./EditorDocument.scss";

function CloseGlyph() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <line x1="1" y1="1" x2="7" y2="7" />
      <line x1="7" y1="1" x2="1" y2="7" />
    </svg>
  );
}

function AlignIcon({ align }: { align: "left" | "center" | "right" }) {
  if (align === "center") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
      </svg>
    );
  }

  if (align === "right") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="9" y1="12" x2="21" y2="12" />
        <line x1="6" y1="18" x2="21" y2="18" />
      </svg>
    );
  }

  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="18" y2="18" />
    </svg>
  );
}

function ShortTitleHeader({
  inputId,
  contentLogo,
  setContentLogo,
  contentHeader,
  setContentHeader,
  contentHeaderFoc,
  setContentHeaderFoc,
  renderSearchOverlay,
  theme,
}: any) {
  return (
    <div>
      <div className="editor-document__short-logo">
        <button
          type="button"
          className="editor-document__short-logo-trigger"
          onClick={() => document.getElementById(inputId)?.click()}
        >
          {contentLogo ? (
            <img className="editor-document__short-logo-image" src={contentLogo} alt="" />
          ) : (
            <span className="editor-document__short-logo-plus">+</span>
          )}
        </button>

        <div className="editor-document__short-logo-copy">
          <div className="editor-document__short-logo-label">ЛОГОТИП</div>
          <div className="editor-document__short-logo-hint">56×56 · квадратный</div>
          {contentLogo ? (
            <button type="button" className="editor-document__short-logo-remove" onClick={() => setContentLogo(null)}>
              удалить
            </button>
          ) : null}
        </div>

        <input
          id={inputId}
          className="editor-document__hidden-input"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => setContentLogo(ev.target?.result ?? null);
            reader.readAsDataURL(file);
          }}
        />
      </div>

      <PlayHeaderEditor
        items={contentHeader}
        setItems={setContentHeader}
        focKey={contentHeaderFoc}
        setFocKey={setContentHeaderFoc}
        T1={theme.T1}
        T2={theme.T2}
        T3={theme.T3}
        SURF={theme.SURF}
        BG={theme.BG}
        mc={theme.mc}
        SH_SM={theme.SH_SM}
        docFont="Arial"
        arrowOffsetX={-18}
        searchScope="short"
        renderSearchOverlay={renderSearchOverlay}
      />
    </div>
  );
}

function getGutterVisibilityClass({
  focused,
  isHead,
  mode,
  blockType,
}: {
  focused: boolean;
  isHead: boolean;
  mode: string;
  blockType: string;
}) {
  if (focused) return "editor-document__gutter--strong";
  if (isHead || blockType === "video" || blockType === "segment") return "editor-document__gutter--medium";
  if (mode === "media" && ["anchor", "sync", "vtr", "offscreen", "lower3", "question", "note"].includes(blockType)) {
    return "editor-document__gutter--soft";
  }
  if (mode === "short" && ["hook", "body", "cta", "action"].includes(blockType)) {
    return "editor-document__gutter--soft";
  }
  return "";
}

function getStandardTextareaClassName({
  mode,
  block,
  displayText,
  isContinuedMeasuredSlice,
}: any) {
  return cx(
    "editor-document__textarea",
    mode === "play" ? "editor-document__textarea--play" : "editor-document__textarea--script",
    `editor-document__textarea--${block.type}`,
    isContinuedMeasuredSlice && "editor-document__textarea--continued",
    block.bold && "editor-document__textarea--bold",
    block.semibold && "editor-document__textarea--semibold",
    block.italic && "editor-document__textarea--italic",
    block.underline && "editor-document__textarea--underline",
    block.color && "editor-document__textarea--custom-color",
    mode === "short" && block.type === "scene" && !displayText && "editor-document__textarea--short-scene-empty",
    mode === "short" && block.type === "cast" && !displayText && "editor-document__textarea--short-cast-empty",
  );
}

export function EditorDocument({
  mode,
  zoom,
  sheetOn,
  docFont,
  spellOn,
  projectId,
  scrollRef,
  onScroll,
  theme,
  note,
  headers,
  blocksState,
  actions,
}: any) {
  const { BG, SURF, T1, T2, T3, mc, SH_SM } = theme;
  const {
    noteEditorRef,
    noteTextRef,
    noteSelRangeRef,
    setNoteText,
    markDirty,
    scheduleNoteHistorySnapshot,
    noteColorOpen,
    setNoteColorOpen,
    noteAlignOpen,
    setNoteAlignOpen,
    noteAlign,
    setNoteAlign,
    noteFontSize,
    setNoteFontSize,
  } = note;
  const {
    playHeader,
    setPlayHeader,
    playHeaderFoc,
    setPlayHeaderFoc,
    mediaHeader,
    setMediaHeader,
    mediaHeaderFoc,
    setMediaHeaderFoc,
    contentHeader,
    setContentHeader,
    contentHeaderFoc,
    setContentHeaderFoc,
    contentLogo,
    setContentLogo,
  } = headers;
  const {
    blocks,
    setBlocks,
    defs,
    scenes,
    selectedScenes,
    setSelectedScenes,
    focId,
    setFocId,
    blockRefs,
    sceneRefs,
    filmEditStateRef,
    typeMenu,
    setTypeMenu,
  } = blocksState;
  const {
    getTooltipAnchorProps,
    renderSearchOverlay,
    renderMarkerOverlay,
    handleMarkerContextMenu,
    onKey,
    autoH,
    updBlock,
    updBlockName,
    chType,
    addAfter,
    dupScene,
    delScene,
    delBlock,
    toggleActSelect,
    changeFilmBlockTypeFromActiveLine,
    sceneNum,
    uid,
  } = actions;

  const {
    cssVars,
    shortLogoInputId,
    onDocumentMouseDown,
    saveNoteSelection,
    restoreNoteSelection,
    execNoteCommand,
    applyFontSize,
    applyNoteColor,
    pages,
    pagePadMode,
  } = useEditorDocument({
    mode,
    zoom,
    docFont,
    projectId,
    scrollRef,
    theme,
    note: {
      noteEditorRef,
      noteTextRef,
      noteSelRangeRef,
      setNoteText,
      markDirty,
      scheduleNoteHistorySnapshot,
      setNoteColorOpen,
    },
    headers: {
      mediaHeader,
      contentHeader,
      mediaHeaderFoc,
      contentHeaderFoc,
    },
    blocksState: {
      defs,
      blocks,
    },
  });

  let pageNum = 1;

  return (
    <div className={cx("editor-document", `editor-document--mode-${mode}`)} style={cssVars}>
      <div
        className="ow-editor-scroll editor-document__scroll"
        ref={scrollRef}
        onScroll={onScroll}
        onMouseDown={onDocumentMouseDown}
      >
        <div className={cx("editor-document__width", zoom > 100 && "editor-document__width--zoomed")}>
          <div className="editor-document__inner">
            {mode === "note" ? (
              <div className="editor-document__note">
                <div className="editor-document__note-toolbar">
                  {NOTE_TOOLBAR_ITEMS.slice(0, 4).map((item, index) =>
                    item.sep ? (
                      <div key={`note-sep-${index}`} className="editor-document__note-toolbar-separator" />
                    ) : (
                      <button
                        key={item.cmd || index}
                        type="button"
                        {...(item.tooltip ? getTooltipAnchorProps(item.tooltip) : {})}
                        title={item.tooltip ? undefined : item.title}
                        className={cx(
                          "editor-document__note-toolbar-button",
                          item.compact && "editor-document__note-toolbar-button--compact",
                          item.styleMod && `editor-document__note-toolbar-button--${item.styleMod}`,
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          execNoteCommand(item);
                        }}
                      >
                        {item.icon}
                      </button>
                    ),
                  )}

                  <div className="editor-document__note-color">
                    <button
                      type="button"
                      {...getTooltipAnchorProps("Цвет текста")}
                      className="editor-document__note-color-button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        saveNoteSelection();
                        setNoteColorOpen((value) => !value);
                      }}
                    >
                      <span className="editor-document__note-color-dot" />
                    </button>

                    {noteColorOpen ? (
                      <div className="editor-document__note-color-menu">
                        {NOTE_COLORS.map((color, index) => (
                          <button
                            key={color}
                            type="button"
                            className={cx("editor-document__note-color-swatch", `editor-document__note-color-swatch--${index}`)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              applyNoteColor(color);
                            }}
                          />
                        ))}

                        <button
                          type="button"
                          className="editor-document__note-color-close"
                          title="Закрыть"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setNoteColorOpen(false);
                          }}
                        >
                          <CloseGlyph />
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {NOTE_TOOLBAR_ITEMS.slice(4).map((item, index) =>
                    item.sep ? (
                      <div key={`note-tail-sep-${index}`} className="editor-document__note-toolbar-separator" />
                    ) : (
                      <button
                        key={`note-tail-${item.cmd || index}`}
                        type="button"
                        title={item.title}
                        className={cx(
                          "editor-document__note-toolbar-button",
                          item.compact && "editor-document__note-toolbar-button--compact",
                          item.styleMod && `editor-document__note-toolbar-button--${item.styleMod}`,
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          execNoteCommand(item);
                        }}
                      >
                        {item.icon}
                      </button>
                    ),
                  )}

                  <div className="editor-document__note-toolbar-separator" />

                  <div className="editor-document__note-align">
                    <button
                      type="button"
                      title="Выравнивание"
                      className={cx(
                        "editor-document__note-toolbar-button",
                        noteAlignOpen && "editor-document__note-toolbar-button--active",
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setNoteAlignOpen((value) => !value);
                      }}
                    >
                      <AlignIcon align={noteAlign} />
                    </button>

                    {noteAlignOpen ? (
                      <div className="editor-document__note-align-menu">
                        {NOTE_ALIGN_OPTIONS.map((option) => (
                          <button
                            key={option.align}
                            type="button"
                            className={cx(
                              "editor-document__note-align-item",
                              noteAlign === option.align && "editor-document__note-align-item--active",
                            )}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const editor = noteEditorRef.current;
                              if (!editor) return;
                              editor.focus();
                              restoreNoteSelection();
                              document.execCommand(option.cmd, false);
                              const html = editor.innerHTML;
                              noteTextRef.current = html;
                              setNoteText(html);
                              markDirty();
                              scheduleNoteHistorySnapshot(html);
                              saveNoteSelection();
                              setNoteAlign(option.align);
                              setNoteAlignOpen(false);
                            }}
                          >
                            <AlignIcon align={option.align as "left" | "center" | "right"} />
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="editor-document__note-toolbar-separator" />

                  <div className="editor-document__note-font-size">
                    <button
                      type="button"
                      className="editor-document__note-toolbar-button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const next = Math.max(4, noteFontSize - 1);
                        setNoteFontSize(next);
                        applyFontSize(next);
                      }}
                    >
                      −
                    </button>

                    <input
                      key={noteFontSize}
                      type="text"
                      defaultValue={noteFontSize}
                      className="editor-document__note-font-input"
                      onMouseDown={() => saveNoteSelection()}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (Number.isNaN(value) || value < 4 || value > 96) return;
                        const selection = window.getSelection();
                        selection?.removeAllRanges();
                        if (noteSelRangeRef.current) selection?.addRange(noteSelRangeRef.current);
                        setNoteFontSize(value);
                        applyFontSize(value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();
                        const value = parseInt(e.currentTarget.value, 10);
                        if (!Number.isNaN(value) && value >= 4 && value <= 96) {
                          const selection = window.getSelection();
                          selection?.removeAllRanges();
                          if (noteSelRangeRef.current) selection?.addRange(noteSelRangeRef.current);
                          setNoteFontSize(value);
                          applyFontSize(value);
                        }
                        e.currentTarget.blur();
                      }}
                    />

                    <button
                      type="button"
                      className="editor-document__note-toolbar-button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const next = Math.min(96, noteFontSize + 1);
                        setNoteFontSize(next);
                        applyFontSize(next);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div
                  className="ow-note-editor editor-document__note-editor"
                  key={projectId}
                  ref={noteEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={spellOn}
                  onInput={(e) => {
                    const html = e.currentTarget.innerHTML;
                    noteTextRef.current = html;
                    setNoteText(html);
                    markDirty();
                    scheduleNoteHistorySnapshot(html);
                    saveNoteSelection();
                  }}
                  onFocus={saveNoteSelection}
                  onKeyUp={saveNoteSelection}
                  onMouseUp={saveNoteSelection}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData("text/plain");
                    document.execCommand("insertText", false, text);
                  }}
                  data-placeholder="Мысли, идеи, наброски…"
                />
              </div>
            ) : null}

            {mode !== "note" && mode === "play" ? (
              <PlayHeaderEditor
                items={playHeader}
                setItems={setPlayHeader}
                focKey={playHeaderFoc}
                setFocKey={setPlayHeaderFoc}
                T1={T1}
                T2={T2}
                T3={T3}
                SURF={SURF}
                BG={BG}
                mc={mc}
                SH_SM={SH_SM}
                docFont={docFont}
                searchScope="play"
                renderSearchOverlay={renderSearchOverlay}
              />
            ) : null}

            {mode !== "note"
              ? pages.map((pageBlocks, pageIdx) => {
                  const isFirstPage = pageIdx === 0;
                  if (!isFirstPage) pageNum += 1;
                  const currentPageNum = pageNum;
                  const showDesktopInlineTitle = isFirstPage && (mode === "media" || mode === "short");

                  return (
                    <React.Fragment key={pageIdx}>
                      <div
                        className={cx(
                          "editor-document__page",
                          `editor-document__page--${pagePadMode}`,
                          sheetOn ? "editor-document__page--sheet" : "editor-document__page--plain",
                        )}
                      >
                        {!isFirstPage ? <div className="editor-document__page-number">{currentPageNum}.</div> : null}

                        {showDesktopInlineTitle ? (
                          <div className="editor-document__inline-title">
                            {mode === "media" ? (
                              <PlayHeaderEditor
                                items={mediaHeader}
                                setItems={setMediaHeader}
                                focKey={mediaHeaderFoc}
                                setFocKey={setMediaHeaderFoc}
                                T1={T1}
                                T2={T2}
                                T3={T3}
                                SURF={SURF}
                                BG={BG}
                                mc={mc}
                                SH_SM={SH_SM}
                                docFont="Arial"
                                arrowOffsetX={-18}
                                searchScope="media"
                                renderSearchOverlay={renderSearchOverlay}
                              />
                            ) : null}

                            {mode === "short" ? (
                              <ShortTitleHeader
                                inputId={shortLogoInputId}
                                contentLogo={contentLogo}
                                setContentLogo={setContentLogo}
                                contentHeader={contentHeader}
                                setContentHeader={setContentHeader}
                                contentHeaderFoc={contentHeaderFoc}
                                setContentHeaderFoc={setContentHeaderFoc}
                                renderSearchOverlay={renderSearchOverlay}
                                theme={theme}
                              />
                            ) : null}
                          </div>
                        ) : null}

                        {pageBlocks.map((entry) => {
                          const { bi, part, split, start = 0, end = null, continued = false, editable = true, sliceIx = 0 } = entry;
                          const block = blocks[bi];
                          const isFilmSlice = part === "filmSlice";
                          const isPlaySlice = part === "playSlice";
                          const isMeasuredSlice = isFilmSlice || isPlaySlice;
                          const blockText = block.text || "";
                          const secondRawText = part === "second" ? blockText.substring(split) : "";
                          const secondTrimLead =
                            part === "second" ? secondRawText.length - secondRawText.replace(/^\s+/, "").length : 0;
                          const sliceStartAbs = isMeasuredSlice ? start : part === "first" ? 0 : part === "second" ? split + secondTrimLead : 0;
                          const sliceEndAbs = isMeasuredSlice
                            ? (end ?? blockText.length)
                            : part === "first"
                              ? split
                              : part === "second"
                                ? blockText.length
                                : blockText.length;
                          const canEditSlicedText =
                            (mode === "film" && (isFilmSlice || part === "first" || part === "second")) ||
                            (mode === "play" && isPlaySlice);
                          const displayText = isMeasuredSlice
                            ? blockText.substring(start, end ?? blockText.length)
                            : part === "first"
                              ? blockText.substring(0, split)
                              : part === "second"
                                ? secondRawText.trimStart()
                                : blockText;
                          const def = defs.find((item) => item.type === block.type) || defs[3];
                          const focused = focId === block.id;
                          const isAct = block.type === "act";
                          const isScene = block.type === "scene";
                          const isCast = block.type === "cast";
                          const isHead = isScene || (mode !== "film" && isAct);
                          const headScene = isHead ? scenes.find((scene) => scene.id === block.id) : null;
                          const playActSelected =
                            mode === "play" &&
                            isAct &&
                            headScene &&
                            headScene.kind === "act"
                              ? scenes.filter((scene) => scene.kind === "scene" && scene.actNum === headScene.actNum).length > 0 &&
                                scenes
                                  .filter((scene) => scene.kind === "scene" && scene.actNum === headScene.actNum)
                                  .every((scene) => selectedScenes.has(scene.id))
                              : false;
                          const headChecked = mode === "play" && isAct ? playActSelected : selectedScenes.has(block.id);
                          const num = isHead ? sceneNum(block.id) : null;
                          const isFirstPart = isMeasuredSlice ? !editable : part === "first";
                          const textareaReadOnly = canEditSlicedText ? false : isFirstPart;
                          const isContinuedMeasuredSlice = isMeasuredSlice && continued;

                          let charName = "";
                          if (block.type === "dialogue" && (part === "first" || part === "second")) {
                            for (let i = bi - 1; i >= 0; i -= 1) {
                              if (blocks[i].type === "char") {
                                charName = (blocks[i].text || "").toUpperCase();
                                break;
                              }
                              if (blocks[i].type === "scene" || blocks[i].type === "act") break;
                            }
                          }

                          return (
                            <React.Fragment key={isMeasuredSlice ? `${block.id}-${part}-${sliceIx}` : `${block.id}-${part}`}>
                              {mode === "film" && block.type === "dialogue" && part === "second" && charName ? (
                                <div className="editor-document__dialogue-meta editor-document__dialogue-meta--continued">
                                  {charName} (ПРОД.)
                                </div>
                              ) : null}

                              <div
                                ref={(el) => {
                                  if (isHead) sceneRefs.current[block.id] = el;
                                }}
                                className={cx(
                                  "editor-document__block-row",
                                  block.color && "editor-document__block-row--has-color",
                                )}
                                style={buildBlockRowVars({
                                  def,
                                  mode,
                                  continued: isContinuedMeasuredSlice,
                                  block,
                                })}
                              >
                                <div
                                  className={cx(
                                    "editor-document__gutter",
                                    getGutterVisibilityClass({
                                      focused,
                                      isHead,
                                      mode,
                                      blockType: block.type,
                                    }),
                                  )}
                                >
                                  {isHead ? (
                                    <>
                                      <div
                                        className={cx(
                                          "editor-document__selection-toggle",
                                          "editor-document__selection-toggle--lg",
                                          headChecked && "editor-document__selection-toggle--checked",
                                        )}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                          if (mode === "play" && isAct && headScene?.actNum) {
                                            toggleActSelect(headScene.actNum);
                                            return;
                                          }
                                          setSelectedScenes((prev) => {
                                            const next = new Set(prev);
                                            if (next.has(block.id)) next.delete(block.id);
                                            else next.add(block.id);
                                            return next;
                                          });
                                        }}
                                      >
                                        {headChecked ? <span className="editor-document__selection-mark">✓</span> : null}
                                      </div>

                                      <button
                                        type="button"
                                        className="editor-document__gutter-button editor-document__gutter-button--accent"
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          dupScene(block.id);
                                        }}
                                      >
                                        ⧉
                                      </button>

                                      <button
                                        type="button"
                                        className="editor-document__gutter-button editor-document__gutter-button--danger"
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          delScene(block.id);
                                        }}
                                      >
                                        <CloseGlyph />
                                      </button>

                                      <span className="editor-document__gutter-num">{num}.</span>
                                    </>
                                  ) : null}

                                  {!isHead && (block.type === "video" || block.type === "segment") ? (
                                    <div
                                      className={cx(
                                        "editor-document__selection-toggle",
                                        "editor-document__selection-toggle--sm",
                                        selectedScenes.has(block.id) && "editor-document__selection-toggle--checked",
                                      )}
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => {
                                        setSelectedScenes((prev) => {
                                          const next = new Set(prev);
                                          if (next.has(block.id)) next.delete(block.id);
                                          else next.add(block.id);
                                          return next;
                                        });
                                      }}
                                    >
                                      {selectedScenes.has(block.id) ? (
                                        <span className="editor-document__selection-mark editor-document__selection-mark--sm">✓</span>
                                      ) : null}
                                    </div>
                                  ) : null}

                                  {!isHead && !isCast ? (
                                    <>
                                      {(mode === "media" && ["anchor", "sync", "vtr", "offscreen", "lower3", "question", "note"].includes(block.type)) ||
                                      (mode === "short" && ["hook", "body", "cta", "action"].includes(block.type)) ? (
                                        <div
                                          className={cx(
                                            "editor-document__selection-toggle",
                                            "editor-document__selection-toggle--sm",
                                            selectedScenes.has(block.id) && "editor-document__selection-toggle--checked",
                                          )}
                                          onMouseDown={(e) => e.preventDefault()}
                                          onClick={() => {
                                            setSelectedScenes((prev) => {
                                              const next = new Set(prev);
                                              if (next.has(block.id)) next.delete(block.id);
                                              else next.add(block.id);
                                              return next;
                                            });
                                          }}
                                        >
                                          {selectedScenes.has(block.id) ? (
                                            <span className="editor-document__selection-mark editor-document__selection-mark--sm">✓</span>
                                          ) : null}
                                        </div>
                                      ) : null}

                                      <span className="editor-document__gutter-label">
                                        {def.hotkey} {def.label.toUpperCase().substring(0, 10)}
                                      </span>

                                      <button
                                        type="button"
                                        className={cx(
                                          "editor-document__gutter-button",
                                          "editor-document__gutter-button--round",
                                          typeMenu === block.id && "editor-document__gutter-button--round-active",
                                        )}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          setTypeMenu(typeMenu === block.id ? null : block.id);
                                        }}
                                      >
                                        +
                                      </button>

                                      <button
                                        type="button"
                                        className="editor-document__gutter-button editor-document__gutter-button--accent"
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          const nextBlock = { ...block, id: uid() };
                                          setBlocks((prev) => {
                                            const index = prev.findIndex((item) => item.id === block.id);
                                            const next = [...prev];
                                            next.splice(index + 1, 0, nextBlock);
                                            return next;
                                          });
                                          markDirty();
                                        }}
                                      >
                                        ⧉
                                      </button>

                                      <button
                                        type="button"
                                        className="editor-document__gutter-button editor-document__gutter-button--danger"
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          delBlock(block.id);
                                        }}
                                      >
                                        <CloseGlyph />
                                      </button>
                                    </>
                                  ) : null}
                                </div>

                                {typeMenu === block.id && !isHead && !isCast ? (
                                  <div className="editor-document__type-menu">
                                    <div className="editor-document__type-menu-title">ИЗМЕНИТЬ ТИП</div>
                                    <div className="editor-document__type-menu-list">
                                      {defs
                                        .filter((item) => item.type !== "scene" && item.type !== "cast" && item.type !== "act")
                                        .map((item) => {
                                          const active = block.type === item.type;
                                          return (
                                            <button
                                              key={item.type}
                                              type="button"
                                              className={cx(
                                                "editor-document__type-menu-item",
                                                active && "editor-document__type-menu-item--active",
                                              )}
                                              onMouseDown={(e) => {
                                                e.preventDefault();
                                                if (mode === "film" && changeFilmBlockTypeFromActiveLine(block.id, item.type)) {
                                                  return;
                                                }
                                                chType(block.id, item.type);
                                              }}
                                            >
                                              <span
                                                className={cx(
                                                  "editor-document__type-menu-hotkey",
                                                  active && "editor-document__type-menu-hotkey--active",
                                                )}
                                              >
                                                {item.hotkey}
                                              </span>
                                              {item.label}
                                            </button>
                                          );
                                        })}
                                    </div>

                                    <div className="editor-document__type-menu-section">
                                      <div className="editor-document__type-menu-title">ДОБАВИТЬ ПОСЛЕ</div>
                                      {defs
                                        .filter((item) => item.type !== "scene" && item.type !== "act")
                                        .map((item) => (
                                          <button
                                            key={`add-${item.type}`}
                                            type="button"
                                            className="editor-document__type-menu-add"
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              addAfter(block.id, item.type);
                                            }}
                                          >
                                            <span>{item.hotkey}</span>+ {item.label}
                                          </button>
                                        ))}
                                    </div>
                                  </div>
                                ) : null}

                                {isHead ? <div className="editor-document__scene-divider" /> : null}

                                {mode === "play" && block.type === "line" ? (
                                  <div className="editor-document__play-line">
                                    <input
                                      value={block.name || ""}
                                      onChange={(e) => updBlockName(block.id, e.target.value)}
                                      onFocus={() => setFocId(block.id)}
                                      onBlur={() => setTimeout(() => setFocId((value) => (value === block.id ? null : value)), 250)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Tab" || e.key === "Enter") {
                                          e.preventDefault();
                                          blockRefs.current[block.id]?.focus();
                                        }
                                      }}
                                      placeholder="Имя"
                                      spellCheck={false}
                                      size={Math.max(3, (block.name || "").length + 1)}
                                      className="editor-document__play-name"
                                    />

                                    <span className="editor-document__play-dot">.</span>

                                    <div className="editor-document__content">
                                      {renderSearchOverlay({
                                        scope: "block",
                                        blockId: block.id,
                                        sliceStart: sliceStartAbs,
                                        text: displayText,
                                        overlayStyle: buildPlayLineOverlayStyle(),
                                      })}

                                      {renderMarkerOverlay({
                                        scope: "block",
                                        blockId: block.id,
                                        sliceStart: sliceStartAbs,
                                        text: displayText,
                                        overlayStyle: buildPlayLineOverlayStyle(),
                                      })}

                                      <textarea
                                        ref={(el) => {
                                          if (!textareaReadOnly) blockRefs.current[block.id] = el;
                                          if (el) {
                                            el.dataset.sliceStart = String(sliceStartAbs);
                                            el.dataset.blockId = String(block.id);
                                            autoH(el);
                                          }
                                        }}
                                        value={displayText}
                                        onChange={(e) => {
                                          if (textareaReadOnly) return;
                                          if (canEditSlicedText) {
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
                                          const prefix = part === "second" ? block.text.substring(0, split) : "";
                                          updBlock(block.id, prefix + e.target.value);
                                          autoH(e.target);
                                        }}
                                        readOnly={textareaReadOnly}
                                        onFocus={(e) => {
                                          if (!textareaReadOnly) {
                                            blockRefs.current[block.id] = e.target;
                                            setFocId(block.id);
                                          }
                                        }}
                                        onBlur={() => setTimeout(() => setFocId((value) => (value === block.id ? null : value)), 250)}
                                        onKeyDown={(e) => {
                                          if (!textareaReadOnly) {
                                            onKey(e, block, { part, isFilmSlice, continued, sliceStartAbs, sliceEndAbs });
                                          }
                                        }}
                                        onContextMenu={(e) => handleMarkerContextMenu(e, block.id, sliceStartAbs)}
                                        placeholder="текст реплики..."
                                        spellCheck={spellOn}
                                        rows={1}
                                        className={cx(
                                          "editor-document__textarea",
                                          "editor-document__textarea--play-body",
                                          block.color && "editor-document__textarea--custom-color",
                                        )}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="editor-document__content">
                                    {renderSearchOverlay({
                                      scope: "block",
                                      blockId: block.id,
                                      sliceStart: sliceStartAbs,
                                      text: displayText,
                                      overlayStyle: buildStandardBlockOverlayStyle({
                                        mode,
                                        def,
                                        block,
                                        continued: isContinuedMeasuredSlice,
                                      }),
                                    })}

                                    {renderMarkerOverlay({
                                      scope: "block",
                                      blockId: block.id,
                                      sliceStart: sliceStartAbs,
                                      text: displayText,
                                      overlayStyle: buildStandardBlockOverlayStyle({
                                        mode,
                                        def,
                                        block,
                                        continued: isContinuedMeasuredSlice,
                                      }),
                                    })}

                                    <textarea
                                      ref={(el) => {
                                        if (!textareaReadOnly) blockRefs.current[block.id] = el;
                                        if (el) {
                                          el.dataset.sliceStart = String(sliceStartAbs);
                                          el.dataset.blockId = String(block.id);
                                          autoH(el);
                                        }
                                      }}
                                      value={displayText}
                                      onChange={(e) => {
                                        if (canEditSlicedText) {
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

                                        if (!textareaReadOnly) {
                                          const prefix = part === "second" ? blockText.substring(0, split) : "";
                                          updBlock(block.id, prefix + e.target.value);
                                          autoH(e.target);
                                        }
                                      }}
                                      readOnly={textareaReadOnly}
                                      onFocus={(e) => {
                                        if (!textareaReadOnly) {
                                          blockRefs.current[block.id] = e.target;
                                          setFocId(block.id);
                                        }
                                      }}
                                      onBlur={() => setTimeout(() => setFocId((value) => (value === block.id ? null : value)), 250)}
                                      onKeyDown={(e) => {
                                        if (!textareaReadOnly) {
                                          onKey(e, block, { part, isFilmSlice, continued, sliceStartAbs, sliceEndAbs });
                                        }
                                      }}
                                      onContextMenu={(e) => handleMarkerContextMenu(e, block.id, sliceStartAbs)}
                                      onPaste={(e) => {
                                        if (!textareaReadOnly && (mode === "play" || mode === "short" || mode === "media")) {
                                          const text = e.clipboardData.getData("text/plain");
                                          const lines = text.split("\n");
                                          if (lines.length <= 1) return;

                                          e.preventDefault();
                                          const el = e.target;
                                          const selStart = el.selectionStart ?? 0;
                                          const selEnd = el.selectionEnd ?? 0;
                                          const absStart = sliceStartAbs + selStart;
                                          const absEnd = sliceStartAbs + selEnd;
                                          const before = blockText.substring(0, absStart);
                                          const after = blockText.substring(absEnd);
                                          const baseType =
                                            block.type !== "spacer" ? block.type : mode === "play" ? "line" : mode === "short" ? "action" : "anchor";
                                          const lineType = (line) => (line.trim() === "" ? "spacer" : baseType);
                                          const firstText = before + lines[0];
                                          const firstType = lineType(lines[0]) === "spacer" && before ? baseType : lineType(lines[0]);
                                          const lastId = uid();
                                          const lastText = lines[lines.length - 1] + after;
                                          const lastType = lineType(lines[lines.length - 1]);
                                          const middle = lines.slice(1, -1);

                                          setBlocks((prev) => {
                                            const index = prev.findIndex((item) => item.id === block.id);
                                            if (index === -1) return prev;

                                            const next = [...prev];
                                            const replacement = [
                                              { ...block, type: firstType, text: firstText },
                                              ...middle.map((line) => ({ id: uid(), type: lineType(line), text: line })),
                                              { id: lastId, type: lastType, text: lastText },
                                            ];
                                            next.splice(index, 1, ...replacement);
                                            return next;
                                          });

                                          markDirty();
                                          setTimeout(() => {
                                            const lastEl = blockRefs.current[lastId];
                                            if (!lastEl) return;
                                            try {
                                              lastEl.focus();
                                            } catch (error) {}
                                            try {
                                              lastEl.setSelectionRange(lastText.length, lastText.length);
                                            } catch (error) {}
                                            autoH(lastEl);
                                          }, 60);
                                          return;
                                        }

                                        if (mode !== "film" || textareaReadOnly) return;

                                        const text = e.clipboardData.getData("text/plain");
                                        const lines = text.split("\n");
                                        if (lines.length <= 1) return;

                                        e.preventDefault();
                                        const el = e.target;
                                        const selStart = el.selectionStart ?? 0;
                                        const selEnd = el.selectionEnd ?? 0;
                                        const absStart = sliceStartAbs + selStart;
                                        const absEnd = sliceStartAbs + selEnd;
                                        const before = blockText.substring(0, absStart);
                                        const after = blockText.substring(absEnd);
                                        const detectFilmType = (line) => {
                                          const trimmed = line.trim();
                                          if (!trimmed) return "spacer";
                                          if (/^(?:\d+[\.\s]+)?(?:ИНТ|INT)[\.\s]/i.test(trimmed)) return "scene";
                                          if (/^(?:\d+[\.\s]+)?(?:НАТ|NAT|EXT)[\.\s]/i.test(trimmed)) return "scene";
                                          if (/^\(\s*.+\s*\)$/.test(trimmed)) return "paren";
                                          if (/^(?:CUT TO|FADE|СМЕНА)/i.test(trimmed)) return "trans";
                                          if (trimmed === trimmed.toUpperCase() && trimmed.length <= 40 && /[A-ZА-ЯЁ]/.test(trimmed)) return "char";
                                          return "action";
                                        };

                                        const firstType = before.trim() ? block.type : detectFilmType(lines[0]);
                                        const firstText = before + lines[0];
                                        const lastLineType = detectFilmType(lines[lines.length - 1]);
                                        const lastText = lines[lines.length - 1] + after;
                                        const middleLines = lines.slice(1, -1);
                                        const lastId = uid();

                                        setBlocks((prev) => {
                                          const index = prev.findIndex((item) => item.id === block.id);
                                          if (index === -1) return prev;

                                          const next = [...prev];
                                          const replacement = [
                                            { ...block, type: firstType, text: firstText },
                                            ...middleLines.map((line) => ({ id: uid(), type: detectFilmType(line), text: line })),
                                            { id: lastId, type: lastLineType, text: lastText },
                                          ];
                                          next.splice(index, 1, ...replacement);
                                          return next;
                                        });

                                        markDirty();
                                        setTimeout(() => {
                                          const lastEl = blockRefs.current[lastId];
                                          if (!lastEl) return;
                                          try {
                                            lastEl.focus({ preventScroll: true });
                                          } catch (error) {
                                            lastEl.focus();
                                          }
                                          const pos = lines[lines.length - 1].length;
                                          try {
                                            lastEl.setSelectionRange(pos, pos);
                                          } catch (error) {}
                                          autoH(lastEl);
                                        }, 0);
                                      }}
                                      placeholder={def.ph}
                                      spellCheck={spellOn && def.spell}
                                      rows={1}
                                      className={getStandardTextareaClassName({
                                        mode,
                                        block,
                                        displayText,
                                        isContinuedMeasuredSlice,
                                      })}
                                    />
                                  </div>
                                )}
                              </div>

                              {mode === "film" && block.type === "dialogue" && part === "first" ? (
                                <div className="editor-document__dialogue-meta editor-document__dialogue-meta--next">(ДАЛЬШЕ)</div>
                              ) : null}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </React.Fragment>
                  );
                })
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}
