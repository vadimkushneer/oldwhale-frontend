import { useTranslation } from "react-i18next";
import type { AppLocale } from "../../i18n/locale";
import { syncDocumentLang } from "../../i18n/locale";
import "./LanguageSwitcher.scss";

const LOCALES: AppLocale[] = ["en", "ru", "kz"];

export type LanguageSwitcherVariant = "fixed" | "onboarding" | "inline";

type LanguageSwitcherProps = {
  variant?: LanguageSwitcherVariant;
  className?: string;
};

export function LanguageSwitcher({ variant = "inline", className }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  const current = (i18n.language?.split("-")[0] === "kk" ? "kz" : i18n.language?.split("-")[0]) as AppLocale;

  const setLocale = (locale: AppLocale) => {
    void i18n.changeLanguage(locale);
    syncDocumentLang(locale);
  };

  const rootClass = [
    "language-switcher",
    variant === "fixed" ? "language-switcher--fixed" : "",
    variant === "onboarding" ? "language-switcher--onboarding" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} role="group" aria-label={t("language.label")}>
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          className={`language-switcher__btn${current === locale ? " language-switcher__btn--active" : ""}`}
          onClick={() => setLocale(locale)}
          aria-pressed={current === locale}
        >
          {t(`language.${locale}`)}
        </button>
      ))}
    </div>
  );
}
