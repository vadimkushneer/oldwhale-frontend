import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import kz from "./locales/kz.json";
import ru from "./locales/ru.json";
import { syncDocumentLang, type AppLocale } from "./locale";

const STORAGE_KEY = "ow_locale";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      kz: { translation: kz },
    },
    fallbackLng: "ru",
    supportedLngs: ["en", "ru", "kz", "kk"],
    nonExplicitSupportedLngs: true,
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("languageChanged", (lng) => {
  const locale = (lng?.split("-")[0] === "kk" ? "kz" : lng?.split("-")[0]) as AppLocale;
  if (locale === "en" || locale === "ru" || locale === "kz") {
    syncDocumentLang(locale);
  }
});

syncDocumentLang(
  (i18n.language?.split("-")[0] === "kk" ? "kz" : i18n.language?.split("-")[0] || "ru") as AppLocale,
);

export default i18n;
