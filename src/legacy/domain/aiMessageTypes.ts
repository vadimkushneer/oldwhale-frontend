/** Chat row type aligned with persisted `role` on AI store messages. */
export type ChatMessageType = "sys" | "ai" | "user";

export function aiMessageTypeFromRole(role: string): ChatMessageType {
  if (role === "user") return "user";
  if (role === "ai") return "ai";
  return "sys";
}

/** Client-side id for messages not issued by the server (greeting, errors, legacy store). */
export function newAiMessageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ow_msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Ensures every message has a stable `id` for keys and selection.
 * Server-issued ids from POST /api/ai/chat are preserved when present.
 */
export function ensureAiMessageId<T extends Record<string, unknown> & { id?: string }>(msg: T): T & { id: string } {
  const id = typeof msg?.id === "string" && msg.id.length > 0 ? msg.id : newAiMessageId();
  return { ...msg, id };
}
