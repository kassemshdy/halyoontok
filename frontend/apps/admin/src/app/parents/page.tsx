"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";

interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
}

const ROLE_KEYS: Record<string, TranslationKey> = {
  parent: "role.parent",
  admin: "role.admin",
  moderator: "role.moderator",
  editor: "role.editor",
};

export default function ParentsPage() {
  const { token } = useAuth();
  const { t } = useLocale();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/users", { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((data) => setUsers(data.filter((u: User) => u.role === "parent")))
      .catch(() => {});
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t("parents.title")}</h1>
      <p className="mt-1 text-gray-500">{users.length} {t("parents.accounts_count")}</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-start font-medium text-gray-600">#</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">{t("auth.email")}</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">{t("content.category")}</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">{t("status.published")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-gray-500">{u.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{u.email}</td>
                <td className="px-4 py-3 text-gray-600">{t(ROLE_KEYS[u.role] || "role.parent")}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {u.is_active ? t("common.active") : t("common.inactive")}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">{t("parents.no_parents")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
