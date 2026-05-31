// @ts-nocheck
import React from "react";

/**
 * In-document film title page — the editor counterpart of the title block that
 * `buildFilmScriptExportHTML` / DOCX / FDX produce. It is bound to the SAME
 * `titlePage` state the exports read, so edits here flow straight to PDF/DOCX/TXT/FDX.
 *
 * Rendered above the paginated script (like the play header) so it never enters
 * the film page-measurement pass and cannot disturb script pagination.
 */
export function FilmTitlePageEditor({ titlePage, setTitlePage, projectName, T1, T2, T3 }: any) {
  const tp = titlePage || {};
  const set = (key: string) => (e: any) => {
    const v = e.target.value;
    setTitlePage((p: any) => ({ ...p, [key]: v }));
  };

  const baseInput: any = {
    background: "transparent",
    border: "none",
    outline: "none",
    textAlign: "center",
    fontFamily: "inherit",
    width: "100%",
    padding: "2px 0",
    boxSizing: "border-box",
  };

  return (
    <div
      className="editor-document__film-title"
      style={{
        maxWidth: "576px",
        margin: "0 auto 18px",
        padding: "44px 24px 28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "150px",
        borderBottom: `1px solid ${T3}33`,
      }}
    >
      <input
        value={tp.title || ""}
        onChange={set("title")}
        placeholder={projectName || "НАЗВАНИЕ"}
        style={{ ...baseInput, color: T1, fontSize: "22px", fontWeight: 600, letterSpacing: "1px", marginBottom: "12px" }}
      />
      <input
        value={tp.genre || ""}
        onChange={set("genre")}
        placeholder="жанр"
        style={{ ...baseInput, color: T2, fontSize: "13px", marginBottom: "18px" }}
      />
      <div style={{ color: T2, fontSize: "11px", letterSpacing: "2px", marginBottom: "4px" }}>Автор</div>
      <input
        value={tp.author || ""}
        onChange={set("author")}
        placeholder="Имя Фамилия"
        style={{ ...baseInput, color: T1, fontSize: "14px" }}
      />
    </div>
  );
}
