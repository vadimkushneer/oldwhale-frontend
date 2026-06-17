import { useCallback, useEffect, useMemo, useState } from "react";
import i18n from "../../../i18n";
import {
  useGetHostingDeployBranchesQuery,
  useListHostingRepoBranchesQuery,
  usePutHostingDeployBranchesMutation,
} from "../../../features/admin/adminApi";
import { useAppSelector } from "../../../hooks";
import { useOnlineStatus } from "../../../hooks/useOnlineStatus";

function extractErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") return i18n.t("admin.deployBranches.saveFailed");
  const data = (error as { data?: { error?: string } }).data;
  if (data?.error) return data.error;
  return i18n.t("admin.deployBranches.saveFailed");
}

export function useUsersAdminDeployBranches() {
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const online = useOnlineStatus();
  const isAdmin = Boolean(token && user?.role === "admin");

  const { data: current, isLoading: currentLoading } = useGetHostingDeployBranchesQuery(undefined, {
    skip: !isAdmin,
  });
  const { data: backendBranches, isLoading: backendBranchesLoading } = useListHostingRepoBranchesQuery(
    "backend",
    { skip: !isAdmin || !online },
  );
  const { data: frontendBranches, isLoading: frontendBranchesLoading } = useListHostingRepoBranchesQuery(
    "frontend",
    { skip: !isAdmin || !online },
  );
  const [putBranches, putState] = usePutHostingDeployBranchesMutation();

  const [backendBranch, setBackendBranch] = useState("main");
  const [frontendBranch, setFrontendBranch] = useState("main");
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!current) return;
    setBackendBranch(current.backendBranch);
    setFrontendBranch(current.frontendBranch);
  }, [current]);

  const branchesLoading = backendBranchesLoading || frontendBranchesLoading;
  const isLoading = currentLoading || branchesLoading;

  const isDirty = useMemo(() => {
    if (!current) return false;
    return backendBranch !== current.backendBranch || frontendBranch !== current.frontendBranch;
  }, [backendBranch, current, frontendBranch]);

  const onSave = useCallback(async () => {
    setSaveError(null);
    try {
      await putBranches({ backendBranch, frontendBranch }).unwrap();
    } catch (error) {
      setSaveError(extractErrorMessage(error));
    }
  }, [backendBranch, frontendBranch, putBranches]);

  return {
    online,
    isLoading,
    backendBranch,
    setBackendBranch,
    frontendBranch,
    setFrontendBranch,
    backendBranches: backendBranches?.branches ?? [],
    frontendBranches: frontendBranches?.branches ?? [],
    updatedAt: current?.updatedAt ?? null,
    isDirty,
    saveBusy: putState.isLoading,
    saveError,
    onSave,
    rootClassName: "users-admin-deploy-branches",
    titleClassName: "users-admin-deploy-branches__title",
    gridClassName: "users-admin-deploy-branches__grid",
    fieldClassName: "users-admin-deploy-branches__field",
    labelClassName: "users-admin-deploy-branches__label",
    selectClassName: "users-admin-deploy-branches__select",
    hintClassName: "users-admin-deploy-branches__hint",
    actionsClassName: "users-admin-deploy-branches__actions",
    submitClassName: "users-admin-deploy-branches__submit",
    metaClassName: "users-admin-deploy-branches__meta",
    errorClassName: "users-admin-deploy-branches__error",
    offlineClassName: "users-admin-deploy-branches__offline",
  };
}
