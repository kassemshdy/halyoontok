/**
 * Custom fetchers for Orval-generated React Query hooks.
 * Each backend service gets its own fetcher with the correct base URL.
 * Auth token is injected from localStorage.
 */

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token") || localStorage.getItem("halyoontok_token");
}

async function baseFetcher<T>(
  baseUrl: string,
  { url, method, params, data, headers }: {
    url: string;
    method: string;
    params?: Record<string, string>;
    data?: unknown;
    headers?: Record<string, string>;
  }
): Promise<T> {
  const token = getToken();
  const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
  const fullUrl = `${baseUrl}${url}${queryString}`;

  const requestHeaders: Record<string, string> = {
    ...headers,
  };
  if (token) requestHeaders["Authorization"] = `Bearer ${token}`;

  const isFormData = data instanceof FormData;
  if (!isFormData && data) requestHeaders["Content-Type"] = "application/json";

  const res = await fetch(fullUrl, {
    method: method.toUpperCase(),
    headers: requestHeaders,
    body: isFormData ? (data as FormData) : data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (errorData as any).detail || `API error: ${res.status}`, errorData);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

/**
 * Fetcher for admin-api (Vite proxy: /api/admin → localhost:8080/api)
 */
export function adminFetcher<T>(config: {
  url: string;
  method: string;
  params?: Record<string, string>;
  data?: unknown;
  headers?: Record<string, string>;
}): Promise<T> {
  return baseFetcher<T>("/api/admin", config);
}

/**
 * Fetcher for front-api (Vite proxy: /api → localhost:8081/api)
 */
export function frontFetcher<T>(config: {
  url: string;
  method: string;
  params?: Record<string, string>;
  data?: unknown;
  headers?: Record<string, string>;
}): Promise<T> {
  return baseFetcher<T>("/api", config);
}

/**
 * Fetcher for upload-api (Vite proxy: /api/upload → localhost:8082/api)
 */
export function uploadFetcher<T>(config: {
  url: string;
  method: string;
  params?: Record<string, string>;
  data?: unknown;
  headers?: Record<string, string>;
}): Promise<T> {
  return baseFetcher<T>("/api/upload", config);
}
