"use client";

import { useLocale } from "./context";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
      title={locale === "ar" ? "Switch to English" : "التبديل للعربية"}
    >
      {locale === "ar" ? "EN" : "عربي"}
    </button>
  );
}
