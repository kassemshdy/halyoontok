import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null, isLoggedIn: false,
  login: async () => {}, register: async () => {}, logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("halyoontok_token");
    if (saved) setToken(saved);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.detail || "Login failed"); }
    const data = await res.json();
    setToken(data.access_token);
    localStorage.setItem("halyoontok_token", data.access_token);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, role: "parent" }) });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.detail || "Registration failed"); }
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => { setToken(null); localStorage.removeItem("halyoontok_token"); }, []);

  return <AuthContext.Provider value={{ token, isLoggedIn: !!token, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
