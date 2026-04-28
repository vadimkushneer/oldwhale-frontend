import type { AiChatLogColumnKey, AiChatLogItem } from "../../../api/types";
import { COLUMN_LABELS, clipText, isVisible } from "../aiChatLogsAdminQuery";
import { useAiChatLogsAdminTable } from "./useAiChatLogsAdminTable";
import "./AiChatLogsAdminTable.scss";

export type AiChatLogsAdminTableProps = {
  rows: AiChatLogItem[];
  columnVisibility: Record<AiChatLogColumnKey, boolean>;
  isLoading: boolean;
};

export function AiChatLogsAdminTable({ rows, columnVisibility, isLoading }: AiChatLogsAdminTableProps) {
  const c = useAiChatLogsAdminTable();

  return (
    <div className={c.scrollClassName}>
      {isLoading ? (
        <div className={c.loadingClassName}>ЗАГРУЗКА…</div>
      ) : (
        <table className={c.tableClassName}>
          <thead>
            <tr className={c.headRowClassName}>
              {isVisible(columnVisibility, "id") ? (
                <th className={`${c.thClassName} ${c.thNowrapClassName}`}>{COLUMN_LABELS.id}</th>
              ) : null}
              {isVisible(columnVisibility, "time") ? (
                <th className={`${c.thClassName} ${c.thNowrapClassName}`}>{COLUMN_LABELS.time}</th>
              ) : null}
              {isVisible(columnVisibility, "user") ? (
                <th className={`${c.thClassName} ${c.thNowrapClassName}`}>{COLUMN_LABELS.user}</th>
              ) : null}
              {isVisible(columnVisibility, "message") ? (
                <th className={c.thClassName}>{COLUMN_LABELS.message}</th>
              ) : null}
              {isVisible(columnVisibility, "reply") ? (
                <th className={c.thClassName}>{COLUMN_LABELS.reply}</th>
              ) : null}
              {isVisible(columnVisibility, "model") ? (
                <th className={c.thClassName}>{COLUMN_LABELS.model}</th>
              ) : null}
              {isVisible(columnVisibility, "message_ids") ? (
                <th className={c.thClassName}>{COLUMN_LABELS.message_ids}</th>
              ) : null}
              {isVisible(columnVisibility, "ip_ua") ? (
                <th className={c.thClassName}>{COLUMN_LABELS.ip_ua}</th>
              ) : null}
              {isVisible(columnVisibility, "editor_mode") ? (
                <th className={c.thClassName}>{COLUMN_LABELS.editor_mode}</th>
              ) : null}
              {isVisible(columnVisibility, "note_context") ? (
                <th className={c.thClassName}>{COLUMN_LABELS.note_context}</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const noteTitle =
                row.note_context != null ? JSON.stringify(row.note_context) : "";
              const notePreview =
                row.note_context != null ? clipText(JSON.stringify(row.note_context), 160) : "—";
              return (
                <tr key={row.id} className={c.bodyRowClassName}>
                  {isVisible(columnVisibility, "id") ? (
                    <td className={`${c.tdClassName} ${c.tdNowrapClassName}`}>{row.id}</td>
                  ) : null}
                  {isVisible(columnVisibility, "time") ? (
                    <td className={`${c.tdClassName} ${c.tdNowrapClassName} ${c.tdSecondaryClassName}`}>
                      {row.created_at}
                    </td>
                  ) : null}
                  {isVisible(columnVisibility, "user") ? (
                    <td className={`${c.tdClassName} ${c.tdSecondaryClassName}`}>
                      {row.user ? (
                        <>
                          {row.user.login}
                          <br />
                          <span className={c.tdEmailClassName}>{row.user.email}</span>
                        </>
                      ) : row.user_id != null ? (
                        `id:${row.user_id}`
                      ) : (
                        "—"
                      )}
                    </td>
                  ) : null}
                  {isVisible(columnVisibility, "message") ? (
                    <td
                      className={`${c.tdClassName} ${c.tdMessageClassName}`}
                      title={row.message}
                    >
                      {clipText(row.message, 200)}
                    </td>
                  ) : null}
                  {isVisible(columnVisibility, "reply") ? (
                    <td className={`${c.tdClassName} ${c.tdMessageClassName}`} title={row.reply}>
                      {clipText(row.reply, 200)}
                    </td>
                  ) : null}
                  {isVisible(columnVisibility, "model") ? (
                    <td
                      className={`${c.tdClassName} ${c.tdModelClassName} ${c.tdSecondaryClassName}`}
                      title={`${row.group_slug} / ${row.variant_slug}`}
                    >
                      {row.group_slug}
                      <br />
                      {row.variant_slug}
                    </td>
                  ) : null}
                  {isVisible(columnVisibility, "message_ids") ? (
                    <td
                      className={`${c.tdClassName} ${c.tdIdsClassName} ${c.tdMutedClassName}`}
                      title={`${row.user_message_id} · ${row.assistant_message_id}`}
                    >
                      {clipText(row.user_message_id, 36)}
                      <br />
                      {clipText(row.assistant_message_id, 36)}
                    </td>
                  ) : null}
                  {isVisible(columnVisibility, "ip_ua") ? (
                    <td
                      className={`${c.tdClassName} ${c.tdIpClassName} ${c.tdMutedClassName}`}
                      title={[row.client_ip ?? "", row.user_agent ?? ""].filter(Boolean).join(" · ")}
                    >
                      {row.client_ip ?? "—"}
                      <br />
                      {clipText(row.user_agent ?? "", 80)}
                    </td>
                  ) : null}
                  {isVisible(columnVisibility, "editor_mode") ? (
                    <td className={`${c.tdClassName} ${c.tdSecondaryClassName}`}>
                      {row.editor_mode ?? "—"}
                    </td>
                  ) : null}
                  {isVisible(columnVisibility, "note_context") ? (
                    <td
                      className={`${c.tdClassName} ${c.tdNoteClassName} ${c.tdMutedClassName}`}
                      title={noteTitle}
                    >
                      {notePreview}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
