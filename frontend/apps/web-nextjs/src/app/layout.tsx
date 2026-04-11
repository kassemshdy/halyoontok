import type { Metadata } from "next";
import "./globals.css";
import { WebProviders } from "./providers";
import { BottomNavWrapper } from "./bottom-nav-wrapper";

export const metadata: Metadata = {
  title: "HalyoonTok",
  description: "Safe Arabic-first short videos for kids",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="h-full bg-black text-white">
        <WebProviders>
          {children}
          <BottomNavWrapper />
        </WebProviders>
      </body>
    </html>
  );
}
