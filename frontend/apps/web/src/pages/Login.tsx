import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLocale, LanguageSwitcher } from "@halyoontok/i18n";

export function LoginPage() {
  const { login } = useAuth();
  const { t } = useLocale();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await login(email, password); navigate("/feed"); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-white">{t("app.name")}</h1><LanguageSwitcher /></div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && <div className="rounded-lg bg-red-900/50 p-3 text-sm text-red-300">{error}</div>}
          <input type="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:border-white focus:outline-none" required />
          <input type="password" placeholder={t("auth.password")} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:border-white focus:outline-none" required />
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-white py-3 font-semibold text-black disabled:opacity-50">{loading ? t("auth.logging_in") : t("auth.login_button")}</button>
        </form>
        <p className="mt-6 text-center text-gray-500"><Link href="/register" className="text-white hover:underline">{t("auth.register")}</Link></p>
        <p className="mt-3 text-center"><Link href="/feed" className="text-gray-500 text-sm">{t("auth.later")}</Link></p>
      </div>
    </div>
  );
}
