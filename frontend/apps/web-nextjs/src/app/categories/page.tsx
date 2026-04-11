"use client";

import Link from "next/link";
import { useLocale } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";

const CATEGORIES: { value: string; labelKey: TranslationKey; icon: string; color: string }[] = [
  { value: "humor", labelKey: "category.humor", icon: "😂", color: "from-yellow-500 to-orange-500" },
  { value: "sports", labelKey: "category.sports", icon: "⚽", color: "from-green-500 to-emerald-500" },
  { value: "science", labelKey: "category.science", icon: "🔬", color: "from-blue-500 to-cyan-500" },
  { value: "english_learning", labelKey: "category.english_learning", icon: "🇬🇧", color: "from-red-500 to-pink-500" },
  { value: "arabic_literacy", labelKey: "category.arabic_literacy", icon: "📖", color: "from-purple-500 to-violet-500" },
  { value: "culture", labelKey: "category.culture", icon: "🏛️", color: "from-amber-500 to-yellow-500" },
  { value: "safe_trends", labelKey: "category.safe_trends", icon: "🔥", color: "from-rose-500 to-red-500" },
  { value: "character_stories", labelKey: "category.character_stories", icon: "🧸", color: "from-indigo-500 to-purple-500" },
];

export default function CategoriesPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-black px-4 pb-24 pt-12">
      <h1 className="text-2xl font-bold text-white">{t("nav.content")}</h1>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/categories/${cat.value}`}
            className={`flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${cat.color} p-6 transition active:scale-95`}
          >
            <span className="text-4xl">{cat.icon}</span>
            <span className="mt-2 text-sm font-semibold text-white">{t(cat.labelKey)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
