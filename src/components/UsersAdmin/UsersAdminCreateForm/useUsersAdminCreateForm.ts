import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import type { UserRole } from "../../../api/types";
import { useCreateUserMutation } from "../../../features/admin/adminApi";

const MIN_LOGIN_LENGTH = 2;
const MIN_PASSWORD_LENGTH = 4;

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "data" in error) {
    return String((error as { data?: { error?: string } }).data?.error || error);
  }
  return String(error);
}

export function useUsersAdminCreateForm() {
  const [createUser, createState] = useCreateUserMutation();

  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [credits, setCredits] = useState("");
  const [error, setError] = useState<string | null>(null);

  const classNames = useMemo(
    () => ({
      formClassName: "users-admin-create-form",
      inputClassName: "users-admin-create-form__input",
      selectClassName: "users-admin-create-form__select",
      submitClassName: "users-admin-create-form__submit",
      errorClassName: "users-admin-create-form__error",
    }),
    [],
  );

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      if (login.length < MIN_LOGIN_LENGTH || password.length < MIN_PASSWORD_LENGTH) {
        setError("Логин ≥2 символа, пароль ≥4 (админ).");
        return;
      }

      const payload: {
        login: string;
        email: string;
        password: string;
        role: UserRole;
        credits?: number;
      } = { login, email, password, role };
      const trimmedCredits = credits.trim();
      if (trimmedCredits !== "") {
        const parsed = Number(trimmedCredits);
        if (Number.isFinite(parsed) && parsed >= 0) {
          payload.credits = Math.trunc(parsed);
        }
      }

      try {
        await createUser(payload).unwrap();
        setLogin("");
        setEmail("");
        setPassword("");
        setRole("user");
        setCredits("");
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      }
    },
    [createUser, credits, email, login, password, role],
  );

  return {
    ...classNames,
    login,
    email,
    password,
    role,
    credits,
    error,
    busy: createState.isLoading,
    setLogin,
    setEmail,
    setPassword,
    setRole,
    setCredits,
    onSubmit,
  };
}
