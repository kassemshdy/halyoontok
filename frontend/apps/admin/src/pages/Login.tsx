import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocale, LanguageSwitcher } from "@halyoontok/i18n";

export function LoginPage() {
  const { login } = useAuth();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await login(email, password); }
    catch (err: any) { setError(err.message || t("auth.login_failed")); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-xl border border-border p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("auth.login_title")}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{t("auth.login_prompt_desc")}</p>
          </div>
          <LanguageSwitcher />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("auth.email")}</label>
            <input type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("auth.password")}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring" required />
          </div>

          <button type="submit" disabled={loading}
            className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? t("auth.logging_in") : t("auth.login_button")}
          </button>
        </form>
      </div>
    </div>
  );
}
