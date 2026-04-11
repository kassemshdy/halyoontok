import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocaleProvider } from "@halyoontok/i18n";
import { AuthProvider } from "@/lib/auth";
import { App } from "@/App";
import "./globals.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LocaleProvider defaultLocale="ar">
        <AuthProvider>
          <App />
        </AuthProvider>
      </LocaleProvider>
    </QueryClientProvider>
  </StrictMode>
);
