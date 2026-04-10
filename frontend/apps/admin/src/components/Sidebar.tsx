"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useLocale, LanguageSwitcher } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { href: string; labelKey: TranslationKey }[] = [
  { href: "/", labelKey: "nav.dashboard" },
  { href: "/content", labelKey: "nav.content" },
  { href: "/moderation", labelKey: "nav.moderation" },
  { href: "/studio", labelKey: "nav.studio" },
  { href: "/trends", labelKey: "nav.trends" },
  { href: "/analytics", labelKey: "nav.analytics" },
  { href: "/parents", labelKey: "nav.parents" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLocale();

  return (
    <aside className="flex h-screen w-56 flex-col border-border bg-background ltr:border-r rtl:border-l">
      <div className="flex items-center justify-between px-4 py-4">
        <p className="text-sm font-semibold tracking-tight">{t("app.name")}</p>
        <LanguageSwitcher />
      </div>

      <Separator />

      <nav className="flex-1 space-y-0.5 px-2 pt-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-8 w-full items-center rounded-md px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                active && "bg-accent font-medium"
              )}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {user && (
        <>
          <Separator />
          <div className="px-4 py-3">
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <Button variant="ghost" size="sm" className="mt-1 h-auto p-0 text-xs text-muted-foreground hover:text-foreground" onClick={logout}>
              {t("auth.logout")}
            </Button>
          </div>
        </>
      )}
    </aside>
  );
}
