import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HalyoonTok",
  description: "Safe Arabic-first short videos for kids",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="h-full bg-black text-white">{children}</body>
    </html>
  );
}
