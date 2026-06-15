"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Language, translations, type Translations } from "./translations";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = "pdp_lifecycle_language";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "es";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "es" || stored === "en") return stored;
  const browserLang = navigator.language.split("-")[0];
  return browserLang === "en" ? "en" : "es";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguageState] = useState<Language>(() =>
    typeof window === "undefined" ? "es" : getInitialLanguage(),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem(STORAGE_KEY, language);
  }, [language, mounted]);

  const value: I18nContextType = {
    language,
    setLanguage: setLanguageState,
    t: translations[language],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within an I18nProvider");
  return context;
}
