import { Link, Navigate } from "react-router-dom";
import { UsersAdminBlockingScreen } from "./UsersAdminBlockingScreen/UsersAdminBlockingScreen";
import { UsersAdminDeployBranches } from "./UsersAdminDeployBranches/UsersAdminDeployBranches";
import { UsersAdminCreateForm } from "./UsersAdminCreateForm/UsersAdminCreateForm";
import { UsersAdminOfflineBanner } from "./UsersAdminOfflineBanner/UsersAdminOfflineBanner";
import { UsersAdminTable } from "./UsersAdminTable/UsersAdminTable";
import { UsersAdminToolbar } from "./UsersAdminToolbar/UsersAdminToolbar";
import { useUsersAdmin } from "./useUsersAdmin";
import "./UsersAdmin.scss";

const LOGIN_REDIRECT_STATE = { from: { pathname: "/admin", search: "" } };

export function UsersAdmin() {
  const vm = useUsersAdmin();

  if (vm.phase === "redirect-login") {
    return <Navigate to="/login" replace state={LOGIN_REDIRECT_STATE} />;
  }

  if (vm.phase === "session-restore") {
    return <UsersAdminBlockingScreen variant="session-restore" />;
  }

  if (vm.phase === "forbidden") {
    return (
      <UsersAdminBlockingScreen variant="forbidden">
        <Link className="users-admin-blocking-screen__editor-link" to="/editor">
          ← К РЕДАКТОРУ
        </Link>
      </UsersAdminBlockingScreen>
    );
  }

  return (
    <div className={vm.rootClassName}>
      <div className={vm.innerClassName}>
        {!vm.online ? <UsersAdminOfflineBanner /> : null}

        <UsersAdminToolbar />

        <UsersAdminDeployBranches />

        <UsersAdminCreateForm />

        <UsersAdminTable
          users={vm.users}
          isLoading={vm.isLoading}
          selfId={vm.selfId}
          patchBusy={vm.patchBusy}
          onPatchUser={vm.onPatchUser}
          deleteBusy={vm.deleteBusy}
          onDeleteUser={vm.onDeleteUser}
        />
      </div>
    </div>
  );
}
