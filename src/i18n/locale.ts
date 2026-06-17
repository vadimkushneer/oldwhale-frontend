import i18n from "./index";

export type AppLocale = "en" | "ru" | "kz";

const LOCALE_TO_BCP47: Record<AppLocale, string> = {
  en: "en-US",
  ru: "ru-RU",
  kz: "kk-KZ",
};

export function getAppLocale(): AppLocale {
  const lng = i18n.language?.split("-")[0];
  if (lng === "en" || lng === "ru" || lng === "kz" || lng === "kk") {
    return lng === "kk" ? "kz" : (lng as AppLocale);
  }
  return "ru";
}

export function formatAppDateTime(iso: string): string {
  if (!iso) return "—";
  try {
    const locale = LOCALE_TO_BCP47[getAppLocale()];
    return new Date(iso).toLocaleString(locale);
  } catch {
    return iso;
  }
}

export function syncDocumentLang(locale: AppLocale) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale === "kz" ? "kk" : locale;
  }
}
