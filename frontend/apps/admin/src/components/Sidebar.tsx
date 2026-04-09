"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useLocale, LanguageSwitcher } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";

const NAV_ITEMS: { href: string; labelKey: TranslationKey; icon: string }[] = [
  { href: "/", labelKey: "nav.dashboard", icon: "📊" },
  { href: "/content", labelKey: "nav.content", icon: "🎬" },
  { href: "/moderation", labelKey: "nav.moderation", icon: "🛡️" },
  { href: "/studio", labelKey: "nav.studio", icon: "🎨" },
  { href: "/trends", labelKey: "nav.trends", icon: "📈" },
  { href: "/analytics", labelKey: "nav.analytics", icon: "📉" },
  { href: "/parents", labelKey: "nav.parents", icon: "👨‍👩‍👧" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLocale();

  return (
    <aside className="flex h-screen w-64 flex-col border-gray-200 bg-white ltr:border-r rtl:border-l">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t("app.name")}</h1>
          <p className="text-sm text-gray-500">{t("app.admin")}</p>
        </div>
        <LanguageSwitcher />
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{item.icon}</span>
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="border-t border-gray-200 p-4">
          <p className="text-sm text-gray-600">{user.email}</p>
          <button
            onClick={logout}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            {t("auth.logout")}
          </button>
        </div>
      )}
    </aside>
  );
}
