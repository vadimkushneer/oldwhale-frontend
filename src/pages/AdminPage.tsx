import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useListUsersQuery,
  usePatchUserMutation,
} from "../features/admin/adminApi";
import { useAppSelector } from "../hooks";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import type { User, UserRole } from "../api/types";
import {
  ACCENT,
  BG,
  SH_IN,
  SH_OUT,
  SURF,
  T1,
  T2,
  T3,
} from "../legacy/ui/tokens";

function formatCreatedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString("ru-RU");
  } catch {
    return iso;
  }
}

export function AdminPage() {
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const restoreStatus = useAppSelector((s) => s.auth.restoreStatus);
  const online = useOnlineStatus();
  const { data: users, isLoading, refetch } = useListUsersQuery(undefined, {
    skip: !token || user?.role !== "admin",
  });
  const [createUser, createState] = useCreateUserMutation();
  const [patchUser, patchState] = usePatchUserMutation();
  const [deleteUser, deleteState] = useDeleteUserMutation();

  const [nLogin, setNLogin] = useState("");
  const [nEmail, setNEmail] = useState("");
  const [nPass, setNPass] = useState("");
  const [nRole, setNRole] = useState<UserRole>("user");
  const [formErr, setFormErr] = useState<string | null>(null);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: { pathname: "/admin", search: "" } }} />;
  }

  if (restoreStatus !== "ready") {
    return (
      <div
        style={{
          width: "100vw",
          minHeight: "100vh",
          background: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T3,
          fontFamily: "'Courier New',monospace",
          letterSpacing: "2px",
          fontSize: "11px",
        }}
      >
        ВОССТАНОВЛЕНИЕ СЕССИИ…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: { pathname: "/admin", search: "" } }} />;
  }

  if (user.role !== "admin") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          color: T1,
          fontFamily: "'Courier New',monospace",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ fontSize: 14, letterSpacing: 2, marginBottom: 12 }}>НЕДОСТАТОЧНО ПРАВ</div>
        <div style={{ color: T3, fontSize: 11, maxWidth: 360, textAlign: "center", lineHeight: 1.6 }}>
          Эта страница доступна только администраторам.
        </div>
        <Link
          to="/editor"
          style={{
            marginTop: 28,
            color: ACCENT,
            fontSize: 11,
            letterSpacing: 2,
            textDecoration: "none",
          }}
        >
          ← К РЕДАКТОРУ
        </Link>
      </div>
    );
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setFormErr(null);
    if (nLogin.length < 2 || nPass.length < 4) {
      setFormErr("Логин ≥2 символа, пароль ≥4 (админ).");
      return;
    }
    try {
      await createUser({
        login: nLogin,
        email: nEmail,
        password: nPass,
        role: nRole,
      }).unwrap();
      setNLogin("");
      setNEmail("");
      setNPass("");
      setNRole("user");
    } catch (err: unknown) {
      const m =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: { error?: string } }).data?.error || err)
          : String(err);
      setFormErr(m);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        color: T1,
        fontFamily: "'Courier New',monospace",
        padding: "24px 20px 40px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {!online ? (
          <div
            style={{
              background: SURF,
              boxShadow: SH_OUT,
              borderRadius: 12,
              padding: "10px 14px",
              color: "#f472b6",
              fontSize: 11,
              letterSpacing: 1,
              marginBottom: 16,
            }}
          >
            НЕТ ПОДКЛЮЧЕНИЯ — АДМИН-ОПЕРАЦИИ НЕДОСТУПНЫ
          </div>
        ) : null}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ letterSpacing: 4, fontSize: 12 }}>АДМИН · ПОЛЬЗОВАТЕЛИ</div>
          <Link to="/editor" style={{ color: ACCENT, fontSize: 10, letterSpacing: 2, textDecoration: "none" }}>
            РЕДАКТОР →
          </Link>
        </div>

        <form
          onSubmit={onCreate}
          style={{
            background: SURF,
            boxShadow: SH_OUT,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            display: "grid",
            gap: 10,
            gridTemplateColumns: "1fr 1fr 1fr auto auto",
            alignItems: "end",
          }}
        >
          <div>
            <div style={{ color: T3, fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>ЛОГИН</div>
            <input
              value={nLogin}
              onChange={(e) => setNLogin(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: BG,
                boxShadow: SH_IN,
                border: "none",
                borderRadius: 8,
                color: T1,
                fontFamily: "inherit",
              }}
            />
          </div>
          <div>
            <div style={{ color: T3, fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>EMAIL</div>
            <input
              value={nEmail}
              onChange={(e) => setNEmail(e.target.value)}
              type="email"
              style={{
                width: "100%",
                padding: "10px 12px",
                background: BG,
                boxShadow: SH_IN,
                border: "none",
                borderRadius: 8,
                color: T1,
                fontFamily: "inherit",
              }}
            />
          </div>
          <div>
            <div style={{ color: T3, fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>ПАРОЛЬ</div>
            <input
              value={nPass}
              onChange={(e) => setNPass(e.target.value)}
              type="password"
              style={{
                width: "100%",
                padding: "10px 12px",
                background: BG,
                boxShadow: SH_IN,
                border: "none",
                borderRadius: 8,
                color: T1,
                fontFamily: "inherit",
              }}
            />
          </div>
          <div>
            <div style={{ color: T3, fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>РОЛЬ</div>
            <select
              value={nRole}
              onChange={(e) => setNRole(e.target.value as UserRole)}
              style={{
                padding: "10px 8px",
                background: BG,
                boxShadow: SH_IN,
                border: "none",
                borderRadius: 8,
                color: T1,
                fontFamily: "inherit",
              }}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={createState.isLoading}
            style={{
              padding: "10px 16px",
              background: ACCENT,
              border: "none",
              borderRadius: 10,
              color: "#fff",
              letterSpacing: 2,
              fontSize: 10,
              cursor: createState.isLoading ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {createState.isLoading ? "…" : "СОЗДАТЬ"}
          </button>
          {formErr ? (
            <div style={{ gridColumn: "1 / -1", color: "#f472b6", fontSize: 11 }}>{formErr}</div>
          ) : null}
        </form>

        <div
          style={{
            background: SURF,
            boxShadow: SH_OUT,
            borderRadius: 16,
            padding: 12,
            overflowX: "auto",
          }}
        >
          {isLoading ? (
            <div style={{ color: T3, fontSize: 11, padding: 16 }}>ЗАГРУЗКА…</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ color: T3, textAlign: "left" }}>
                  <th style={{ padding: "8px 6px" }}>ID</th>
                  <th style={{ padding: "8px 6px" }}>ЛОГИН</th>
                  <th style={{ padding: "8px 6px" }}>EMAIL</th>
                  <th style={{ padding: "8px 6px" }}>РОЛЬ</th>
                  <th style={{ padding: "8px 6px" }}>ОТКЛ.</th>
                  <th style={{ padding: "8px 6px" }}>СОЗДАН</th>
                  <th style={{ padding: "8px 6px" }} />
                </tr>
              </thead>
              <tbody>
                {(users || []).map((row: User) => (
                  <UserRow
                    key={row.id}
                    row={row}
                    selfId={user.id}
                    patchUser={patchUser}
                    deleteUser={deleteUser}
                    patchBusy={patchState.isLoading}
                    deleteBusy={deleteState.isLoading}
                    onChanged={() => void refetch()}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

type PatchUserFn = ReturnType<typeof usePatchUserMutation>[0];
type DeleteUserFn = ReturnType<typeof useDeleteUserMutation>[0];

function UserRow({
  row,
  selfId,
  patchUser,
  deleteUser,
  patchBusy,
  deleteBusy,
  onChanged,
}: {
  row: User;
  selfId: number;
  patchUser: PatchUserFn;
  deleteUser: DeleteUserFn;
  patchBusy: boolean;
  deleteBusy: boolean;
  onChanged: () => void;
}) {
  const [role, setRole] = useState<UserRole>(row.role);
  const [disabled, setDisabled] = useState(row.disabled);
  const isSelf = row.id === selfId;

  useEffect(() => {
    setRole(row.role);
    setDisabled(row.disabled);
  }, [row.id, row.role, row.disabled]);

  return (
    <tr style={{ borderTop: `1px solid ${T3}33` }}>
      <td style={{ padding: "8px 6px", color: T2 }}>{row.id}</td>
      <td style={{ padding: "8px 6px" }}>{row.login}</td>
      <td style={{ padding: "8px 6px", color: T2 }}>{row.email}</td>
      <td style={{ padding: "8px 6px" }}>
        <select
          value={role}
          disabled={isSelf || patchBusy}
          onChange={(e) => setRole(e.target.value as UserRole)}
          style={{
            padding: "6px",
            background: BG,
            border: "none",
            borderRadius: 6,
            color: T1,
            fontFamily: "inherit",
          }}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </td>
      <td style={{ padding: "8px 6px" }}>
        <input
          type="checkbox"
          checked={disabled}
          disabled={isSelf || patchBusy}
          onChange={(e) => setDisabled(e.target.checked)}
        />
      </td>
      <td style={{ padding: "8px 6px", color: T2, whiteSpace: "nowrap" }}>{formatCreatedAt(row.created_at)}</td>
      <td style={{ padding: "8px 6px", display: "flex", gap: 8 }}>
        <button
          type="button"
          disabled={isSelf || patchBusy || (role === row.role && disabled === row.disabled)}
          onClick={async () => {
            const body: { disabled?: boolean; role?: UserRole } = {};
            if (disabled !== row.disabled) body.disabled = disabled;
            if (role !== row.role) body.role = role;
            await patchUser({ id: row.id, ...body }).unwrap();
            onChanged();
          }}
          style={{
            padding: "6px 10px",
            background: "#34d399",
            border: "none",
            borderRadius: 8,
            color: "#0f172a",
            fontSize: 9,
            letterSpacing: 1,
            cursor: isSelf ? "default" : "pointer",
            fontFamily: "inherit",
          }}
        >
          СОХРАНИТЬ
        </button>
        <button
          type="button"
          disabled={isSelf || deleteBusy}
          onClick={async () => {
            if (!window.confirm(`Удалить пользователя ${row.login}?`)) return;
            await deleteUser({ id: row.id }).unwrap();
            onChanged();
          }}
          style={{
            padding: "6px 10px",
            background: "#f472b6",
            border: "none",
            borderRadius: 8,
            color: "#1a1b2e",
            fontSize: 9,
            letterSpacing: 1,
            cursor: isSelf ? "default" : "pointer",
            fontFamily: "inherit",
          }}
        >
          УДАЛИТЬ
        </button>
      </td>
    </tr>
  );
}
