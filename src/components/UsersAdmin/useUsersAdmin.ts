import { useCallback, useMemo } from "react";
import type { User, UserRole } from "../../api/types";
import {
  useDeleteUserMutation,
  useListUsersQuery,
  usePatchUserMutation,
} from "../../features/admin/adminApi";
import { useAppSelector } from "../../hooks";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

export type UsersAdminPhase =
  | "redirect-login"
  | "session-restore"
  | "forbidden"
  | "ready";

export type UsersAdminPatchBody = {
  disabled?: boolean;
  role?: UserRole;
  credits?: number;
};

export type UseUsersAdminResult =
  | { phase: "redirect-login" }
  | { phase: "session-restore" }
  | { phase: "forbidden" }
  | {
      phase: "ready";
      online: boolean;
      users: User[];
      isLoading: boolean;
      refetch: () => void;
      selfId: number;
      patchBusy: boolean;
      onPatchUser: (id: number, body: UsersAdminPatchBody) => Promise<void>;
      deleteBusy: boolean;
      onDeleteUser: (id: number) => Promise<void>;
      rootClassName: string;
      innerClassName: string;
    };

export function useUsersAdmin(): UseUsersAdminResult {
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const restoreStatus = useAppSelector((s) => s.auth.restoreStatus);
  const online = useOnlineStatus();

  const { data: users, isLoading, refetch } = useListUsersQuery(undefined, {
    skip: !token || user?.role !== "admin",
  });
  const [patchUser, patchState] = usePatchUserMutation();
  const [deleteUser, deleteState] = useDeleteUserMutation();

  const onPatchUser = useCallback(
    async (id: number, body: UsersAdminPatchBody) => {
      await patchUser({ id, ...body }).unwrap();
    },
    [patchUser],
  );

  const onDeleteUser = useCallback(
    async (id: number) => {
      await deleteUser({ id }).unwrap();
    },
    [deleteUser],
  );

  const phase = useMemo((): UsersAdminPhase => {
    if (!token) return "redirect-login";
    if (restoreStatus !== "ready") return "session-restore";
    if (!user) return "redirect-login";
    if (user.role !== "admin") return "forbidden";
    return "ready";
  }, [token, restoreStatus, user]);

  if (phase === "redirect-login") return { phase: "redirect-login" };
  if (phase === "session-restore") return { phase: "session-restore" };
  if (phase === "forbidden") return { phase: "forbidden" };

  return {
    phase: "ready",
    online,
    users: users ?? [],
    isLoading,
    refetch,
    selfId: user!.id,
    patchBusy: patchState.isLoading,
    onPatchUser,
    deleteBusy: deleteState.isLoading,
    onDeleteUser,
    rootClassName: "users-admin",
    innerClassName: "users-admin__inner",
  };
}
