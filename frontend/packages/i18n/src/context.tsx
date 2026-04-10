"use client";

import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from "react";
import { ar } from "./locales/ar";
import { en } from "./locales/en";

export type Locale = "ar" | "en";
export type TranslationKey = keyof typeof ar;

const locales = { ar, en } as const;

interface LocaleContextType {
  locale: Locale;
  dir: "rtl" | "ltr";
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "ar",
  dir: "rtl",
  setLocale: () => {},
  t: (key) => key,
});

const STORAGE_KEY = "halyoontok_locale";

export function LocaleProvider({ children, defaultLocale = "ar" }: { children: ReactNode; defaultLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && (saved === "ar" || saved === "en")) {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return locales[locale]?.[key] || locales["ar"][key] || key;
  }, [locale]);

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <LocaleContext.Provider value={{ locale, dir, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
