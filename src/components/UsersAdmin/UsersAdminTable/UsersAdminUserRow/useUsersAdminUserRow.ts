import { useCallback, useEffect, useMemo, useState } from "react";
import i18n from "../../../../i18n";
import type { User, UserRole } from "../../../../api/types";
import type { UsersAdminPatchBody } from "../../useUsersAdmin";

export type UseUsersAdminUserRowArgs = {
  user: User;
  selfId: number;
  patchBusy: boolean;
  onPatchUser: (id: number, body: UsersAdminPatchBody) => Promise<void> | void;
  deleteBusy: boolean;
  onDeleteUser: (id: number) => Promise<void> | void;
  confirmDelete?: (user: User) => boolean;
};

function defaultConfirmDelete(user: User): boolean {
  return window.confirm(i18n.t("admin.users.row.confirmDelete", { login: user.login }));
}

function normalizeCredits(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
}

/** Extracts a human-readable message from an RTK Query / fetch rejection. */
function getPatchErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const data = (error as { data?: { error?: string } }).data;
    if (data?.error) return data.error;
    const message = (error as { error?: string }).error;
    if (typeof message === "string" && message) return message;
  }
  return i18n.t("admin.common.saveFailed");
}

/** Renders the row's `created_at` timestamp using the active locale. */
export function formatUserCreatedAt(iso: string): string {
  if (!iso) return "";
  const locale =
    i18n.language === "en" ? "en-US" : i18n.language === "kz" ? "kk-KZ" : "ru-RU";
  try {
    return new Date(iso).toLocaleString(locale);
  } catch {
    return iso;
  }
}

export function useUsersAdminUserRow({
  user,
  selfId,
  patchBusy,
  onPatchUser,
  deleteBusy,
  onDeleteUser,
  confirmDelete = defaultConfirmDelete,
}: UseUsersAdminUserRowArgs) {
  const userCredits = useMemo(() => normalizeCredits(user.credits), [user.credits]);
  const [role, setRole] = useState<UserRole>(user.role);
  const [disabled, setDisabled] = useState<boolean>(user.disabled);
  const [credits, setCredits] = useState<number>(() => normalizeCredits(user.credits));
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setRole(user.role);
    setDisabled(user.disabled);
    setCredits(userCredits);
    setSaveError(null);
  }, [user.id, user.role, user.disabled, userCredits]);

  const isSelf = user.id === selfId;
  const isDirty = role !== user.role || disabled !== user.disabled || credits !== userCredits;
  const saveDisabled = isSelf || patchBusy || !isDirty;
  const deleteDisabled = isSelf || deleteBusy;
  const formattedCreatedAt = useMemo(
    () => formatUserCreatedAt(user.created_at),
    [user.created_at],
  );

  const onSave = useCallback(async () => {
    if (saveDisabled) return;
    const body: UsersAdminPatchBody = {};
    if (disabled !== user.disabled) body.disabled = disabled;
    if (role !== user.role) body.role = role;
    if (credits !== userCredits) body.credits = normalizeCredits(credits);
    setSaveError(null);
    try {
      await onPatchUser(user.id, body);
    } catch (error) {
      setSaveError(getPatchErrorMessage(error));
    }
  }, [
    credits,
    disabled,
    onPatchUser,
    role,
    saveDisabled,
    user.disabled,
    user.id,
    user.role,
    userCredits,
  ]);

  const onDelete = useCallback(async () => {
    if (deleteDisabled) return;
    if (!confirmDelete(user)) return;
    await onDeleteUser(user.id);
  }, [confirmDelete, deleteDisabled, onDeleteUser, user]);

  const classNames = useMemo(
    () => ({
      rowClassName: "users-admin-user-row",
      cellClassName: "users-admin-user-row__cell",
      cellMutedClassName:
        "users-admin-user-row__cell users-admin-user-row__cell--muted",
      cellNowrapClassName:
        "users-admin-user-row__cell users-admin-user-row__cell--nowrap",
      cellMutedNowrapClassName:
        "users-admin-user-row__cell users-admin-user-row__cell--muted users-admin-user-row__cell--nowrap",
      cellActionsClassName:
        "users-admin-user-row__cell users-admin-user-row__cell--actions",
      roleSelectClassName: "users-admin-user-row__role-select",
      creditsInputClassName: "users-admin-user-row__credits-input",
      disabledCheckboxClassName: "users-admin-user-row__disabled-checkbox",
      saveButtonClassName:
        "users-admin-user-row__button users-admin-user-row__button--save",
      deleteButtonClassName:
        "users-admin-user-row__button users-admin-user-row__button--delete",
      saveErrorClassName: "users-admin-user-row__save-error",
    }),
    [],
  );

  return {
    ...classNames,
    role,
    setRole,
    disabled,
    setDisabled,
    credits,
    setCredits,
    isSelf,
    saveDisabled,
    deleteDisabled,
    formattedCreatedAt,
    saveError,
    onSave,
    onDelete,
  };
}
