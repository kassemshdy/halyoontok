import { Link, useLocation } from "wouter";
import { useLocale, LanguageSwitcher } from "@halyoontok/i18n";

export function BottomNav() {
  const [location] = useLocation();
  const { t } = useLocale();

  if (["/login", "/register"].includes(location)) return null;

  const items = [
    { href: "/feed", label: t("feed.for_you"), icon: "⌂" },
    { href: "/categories", label: t("nav.content"), icon: "▦" },
    { href: "/login", label: t("auth.login"), icon: "◉" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-gray-800 bg-black/90 px-2 py-2 backdrop-blur-sm">
      {items.map((item) => {
        const active = location === item.href || (item.href !== "/feed" && location.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 px-4 py-1 ${active ? "text-white" : "text-gray-500"}`}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
      <div className="flex flex-col items-center gap-0.5 px-4 py-1"><LanguageSwitcher /></div>
    </nav>
  );
}
