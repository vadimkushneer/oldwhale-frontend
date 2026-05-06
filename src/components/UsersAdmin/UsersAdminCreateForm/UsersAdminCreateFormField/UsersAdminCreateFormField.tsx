import type { ReactNode } from "react";
import { useUsersAdminCreateFormField } from "./useUsersAdminCreateFormField";
import "./UsersAdminCreateFormField.scss";

export type UsersAdminCreateFormFieldProps = {
  label: string;
  children: ReactNode;
};

/**
 * Labeled wrapper used by `UsersAdminCreateForm` for every input field.
 *
 * The control is rendered inside the `<label>` element so that clicking the
 * label focuses the inner input without us having to thread `id`/`htmlFor`
 * pairs through the form.
 */
export function UsersAdminCreateFormField({
  label,
  children,
}: UsersAdminCreateFormFieldProps) {
  const { rootClassName, labelClassName, controlClassName } =
    useUsersAdminCreateFormField();

  return (
    <label className={rootClassName}>
      <span className={labelClassName}>{label}</span>
      <span className={controlClassName}>{children}</span>
    </label>
  );
}
