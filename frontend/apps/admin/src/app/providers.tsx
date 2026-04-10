"use client";

import { AuthProvider } from "@/lib/auth";
import { AuthGate } from "@/components/AuthGate";
import { LocaleProvider } from "@halyoontok/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider defaultLocale="ar">
      <AuthProvider>
        <AuthGate>{children}</AuthGate>
      </AuthProvider>
    </LocaleProvider>
  );
}
