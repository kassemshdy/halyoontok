import { useLocale } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";
import { useUsers } from "@/hooks/use-api";

const ROLE_KEYS: Record<string, TranslationKey> = { parent: "role.parent", admin: "role.admin", moderator: "role.moderator", editor: "role.editor" };

export function ParentsPage() {
  const { t } = useLocale();
  const { data: allUsers = [] } = useUsers();
  const users = allUsers.filter((u: any) => u.role === "parent");

  return (
    <div>
      <h1 className="text-lg font-semibold">{t("parents.title")}</h1>
      <p className="text-sm text-muted-foreground">{users.length} {t("parents.accounts_count")}</p>
      <div className="mt-6 rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-2.5 text-start text-xs font-medium text-muted-foreground">#</th>
              <th className="px-4 py-2.5 text-start text-xs font-medium text-muted-foreground">{t("auth.email")}</th>
              <th className="px-4 py-2.5 text-start text-xs font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-2.5 text-start text-xs font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{u.id}</td>
                <td className="px-4 py-2.5 font-medium">{u.email}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{t(ROLE_KEYS[u.role] || "role.parent")}</td>
                <td className="px-4 py-2.5"><span className={`rounded-full border px-2 py-0.5 text-xs ${u.is_active ? "border-border" : "border-destructive/50 text-destructive"}`}>{u.is_active ? t("common.active") : t("common.inactive")}</span></td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">{t("parents.no_parents")}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
