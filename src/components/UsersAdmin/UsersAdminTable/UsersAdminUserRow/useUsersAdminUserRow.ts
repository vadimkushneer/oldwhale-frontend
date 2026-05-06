import { useCallback, useEffect, useMemo, useState } from "react";
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
  return window.confirm(`Удалить пользователя ${user.login}?`);
}

/** Renders the row's `created_at` timestamp using the local Russian locale. */
export function formatUserCreatedAt(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("ru-RU");
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
  const [role, setRole] = useState<UserRole>(user.role);
  const [disabled, setDisabled] = useState<boolean>(user.disabled);

  useEffect(() => {
    setRole(user.role);
    setDisabled(user.disabled);
  }, [user.id, user.role, user.disabled]);

  const isSelf = user.id === selfId;
  const isDirty = role !== user.role || disabled !== user.disabled;
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
    await onPatchUser(user.id, body);
  }, [
    disabled,
    onPatchUser,
    role,
    saveDisabled,
    user.disabled,
    user.id,
    user.role,
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
      disabledCheckboxClassName: "users-admin-user-row__disabled-checkbox",
      saveButtonClassName:
        "users-admin-user-row__button users-admin-user-row__button--save",
      deleteButtonClassName:
        "users-admin-user-row__button users-admin-user-row__button--delete",
    }),
    [],
  );

  return {
    ...classNames,
    role,
    setRole,
    disabled,
    setDisabled,
    isSelf,
    saveDisabled,
    deleteDisabled,
    formattedCreatedAt,
    onSave,
    onDelete,
  };
}
