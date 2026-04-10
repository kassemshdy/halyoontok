"use client";

import { LocaleProvider } from "@halyoontok/i18n";
import { WebAuthProvider } from "@/lib/auth";

export function WebProviders({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider defaultLocale="ar">
      <WebAuthProvider>{children}</WebAuthProvider>
    </LocaleProvider>
  );
}
