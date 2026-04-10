"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { useLocale } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface User { id: number; email: string; role: string; is_active: boolean; }
const ROLE_KEYS: Record<string, TranslationKey> = { parent: "role.parent", admin: "role.admin", moderator: "role.moderator", editor: "role.editor" };

export default function ParentsPage() {
  const { token } = useAuth();
  const { t } = useLocale();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => { if (!token) return; fetch("/api/admin/users", { headers: authHeaders(token) }).then((r) => r.json()).then((data) => setUsers(data.filter((u: User) => u.role === "parent"))).catch(() => {}); }, [token]);

  return (
    <div>
      <h1 className="text-lg font-semibold">{t("parents.title")}</h1>
      <p className="text-sm text-muted-foreground">{users.length} {t("parents.accounts_count")}</p>

      <div className="mt-6 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t("auth.email")}</TableHead>
              <TableHead>{t("content.category")}</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="text-muted-foreground">{u.id}</TableCell>
                <TableCell className="font-medium">{u.email}</TableCell>
                <TableCell className="text-muted-foreground">{t(ROLE_KEYS[u.role] || "role.parent")}</TableCell>
                <TableCell>
                  <Badge variant={u.is_active ? "outline" : "destructive"}>
                    {u.is_active ? t("common.active") : t("common.inactive")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">{t("parents.no_parents")}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
