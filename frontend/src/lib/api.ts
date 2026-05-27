import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

/**
 * Same-origin API client. In production the reverse proxy routes /api to
 * Symfony; in dev next.config rewrites do the same — so cookies (the BEARER
 * JWT + refresh token) behave identically to the legacy SPA.
 */

function currentLocale(): string {
  if (typeof window === "undefined") return "en";
  return sessionStorage.getItem("locale") || "en";
}

// Locale-scoped client (/api/v1/{locale}/...). baseURL is set per request so
// it stays correct after a locale switch and is safe during SSR.
export const apiAxios = axios.create({
  baseURL: "/api/v1/en",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  withCredentials: true,
});

apiAxios.interceptors.request.use((config) => {
  config.baseURL = `/api/v1/${currentLocale()}`;
  return config;
});

// No-locale client for /api/v1 endpoints that aren't locale-scoped (check-in,
// device); refresh overrides baseURL to /api.
export const apiV1Axios = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

type RetriableConfig = InternalAxiosRequestConfig & { __isRetryRequest?: boolean };

const REFRESHABLE_MESSAGES = ["Invalid JWT Token", "Expired JWT Token", "JWT Token not found"];

// Single in-flight refresh; concurrent 401s queue behind it (mutex).
let refreshPromise: Promise<void> | null = null;

export function emitWorkspaceInvalid(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("dailybrew:workspace-invalid"));
  }
}

apiAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const response = error.response;
    const config = error.config as RetriableConfig | undefined;
    if (!response || !config) return Promise.reject(error);

    const message = response.data?.message;

    if (
      response.status === 401 &&
      message !== undefined &&
      REFRESHABLE_MESSAGES.includes(message) &&
      !config.__isRetryRequest
    ) {
      config.__isRetryRequest = true;
      try {
        if (!refreshPromise) {
          refreshPromise = apiV1Axios
            .post("/token/refresh", null, { baseURL: "/api" })
            .then(() => undefined)
            .finally(() => {
              refreshPromise = null;
            });
        }
        await refreshPromise;
        return apiAxios(config);
      } catch {
        refreshPromise = null;
        return Promise.reject(error);
      }
    }

    // A 403 on a workspace-scoped endpoint means the stored workspace is stale.
    if (response.status === 403 && config.url?.includes("/workspaces/")) {
      clearWorkspacePublicId();
      emitWorkspaceInvalid();
    }

    return Promise.reject(error);
  },
);

// --- current workspace (localStorage + server, server authoritative) ---

const WORKSPACE_KEY = "workspace_public_id";

export function getWorkspacePublicId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WORKSPACE_KEY);
}

export function setWorkspacePublicId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WORKSPACE_KEY, id);
  // Fire and forget — persist to server for cross-device sync.
  apiAxios.put("/users/me/current-workspace", { workspacePublicId: id }).catch(() => {});
}

export function clearWorkspacePublicId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WORKSPACE_KEY);
}
