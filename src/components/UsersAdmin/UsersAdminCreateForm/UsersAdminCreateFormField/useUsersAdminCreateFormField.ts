import { useMemo } from "react";

export function useUsersAdminCreateFormField() {
  return useMemo(
    () => ({
      rootClassName: "users-admin-create-form-field",
      labelClassName: "users-admin-create-form-field__label",
      controlClassName: "users-admin-create-form-field__control",
    }),
    [],
  );
}
