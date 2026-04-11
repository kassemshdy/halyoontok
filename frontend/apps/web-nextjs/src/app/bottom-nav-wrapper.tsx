"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

const HIDE_ON = ["/login", "/register"];

export function BottomNavWrapper() {
  const pathname = usePathname();
  if (HIDE_ON.includes(pathname)) return null;
  return <BottomNav />;
}
