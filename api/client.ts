import type { components } from "@/api/schema";
import axios, { AxiosError, isAxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

/**
 * Shared Axios instance for every authenticated backend call.
 *
 * The module owns the token lifecycle so no call site has to: each request is
 * signed with the stored access token, and a `401` triggers a single
 * refresh-and-retry. If the refresh is itself rejected as unauthorized, the
 * stored tokens are cleared and the registered auth-failure handler returns the
 * user to sign-in.
 *
 * @packageDocumentation
 */

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Per-request flag the response interceptor uses to cap retries at one (see the
// refresh flow below).
declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

type RefreshResponse = components["schemas"]["AuthTokensEntity"];

/**
 * Signals that the session is over because no refresh token is stored locally.
 *
 * @remarks
 * A distinct type so the interceptor logs the user out on a genuine auth failure
 * but lets transient network faults bubble up untouched. A refresh token the
 * backend *rejects* instead arrives as an Axios 401/403, handled separately.
 */
class SessionExpiredError extends Error {
  constructor(message = "Session expired") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Single in-flight refresh shared by all callers; started and cleared via
// refreshOnce.
let refreshPromise: Promise<string> | null = null;

let onAuthFailure: (() => void) | null = null;

/**
 * Registers the callback fired on terminal auth failure (the session is over),
 * or clears it with `null`.
 *
 * @remarks
 * Injected rather than imported so this low-level client never depends on React
 * or the auth context: the auth provider wires itself in on mount and clears the
 * handler on unmount, keeping the dependency arrow one-way (auth → client).
 */
export const setAuthFailureHandler = (handler: (() => void) | null) => {
  onAuthFailure = handler;
};

/**
 * Exchanges the stored refresh token for a fresh access/refresh pair and
 * persists both to secure storage.
 *
 * @returns The new access token, so the caller can immediately retry the
 * request that triggered the refresh without re-reading storage.
 * @throws {@link SessionExpiredError} When no refresh token is stored.
 * @throws {Error} When the backend responds with a malformed token pair.
 */
export const refreshTokens = async (): Promise<string> => {
  const refreshToken = await SecureStore.getItemAsync("refreshToken");
  if (!refreshToken) {
    throw new SessionExpiredError("No refresh token available");
  }

  // Raw axios, not apiClient: the refresh must skip the interceptors, or a 401
  // from /auth/refresh would recurse straight back into another refresh.
  const { data } = await axios.post<RefreshResponse>(
    `${BASE_URL}/auth/refresh`,
    { refreshToken },
  );

  if (!data?.accessToken || !data?.refreshToken) {
    throw new Error("Malformed refresh response");
  }

  await SecureStore.setItemAsync("accessToken", data.accessToken);
  await SecureStore.setItemAsync("refreshToken", data.refreshToken);
  return data.accessToken;
};

// Start a refresh if none is in flight; otherwise join the running one. One
// shared promise means concurrent 401s — or a proactive check racing the
// interceptor — hit /auth/refresh exactly once and never race writes to secure
// storage. The slot is cleared once settled so the next expiry starts fresh.
const refreshOnce = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

// Refresh slightly before the token's real expiry so a request that leaves on a
// still-"valid" token doesn't cross the boundary in flight, and to absorb minor
// clock skew between device and server.
const TOKEN_EXPIRY_BUFFER_SECONDS = 60;

/**
 * Whether `token` is within {@link TOKEN_EXPIRY_BUFFER_SECONDS} of expiring
 * (or already expired, or unreadable).
 *
 * @remarks
 * A decode failure or a missing `exp` claim counts as "expiring" so a malformed
 * token triggers a refresh attempt rather than being trusted blindly.
 */
const isExpiringSoon = (token: string): boolean => {
  try {
    const { exp } = jwtDecode(token);
    if (typeof exp !== "number") return true;
    return exp - Date.now() / 1000 <= TOKEN_EXPIRY_BUFFER_SECONDS;
  } catch {
    return true;
  }
};

/**
 * Returns an access token good for at least the next
 * {@link TOKEN_EXPIRY_BUFFER_SECONDS}, refreshing first if the stored one is
 * expired or about to be.
 *
 * @remarks
 * Axios call sites don't need this — the response interceptor refreshes
 * reactively on a `401`. It exists for requests that bypass this client, above
 * all the native audio player fetching its own stream: those never surface a
 * `401` to catch, so a token going stale mid-playback would silently fail the
 * next track. Checking up front keeps that path alive.
 *
 * @returns A fresh-enough token; `null` when no session is stored; or the stored
 * token unchanged if a needed refresh fails, so the request fails as it would
 * have rather than blocking playback.
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (!token || !isExpiringSoon(token)) return token;

  try {
    return await refreshOnce();
  } catch {
    return token;
  }
};

// Attach the current access token to every outgoing request. Read from secure
// storage per request rather than cached in memory so a token refreshed on one
// request is picked up by the next without any manual propagation.
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Refresh-and-retry on expiry. A `401` is treated as "access token stale":
// refresh once, then replay the original request with the new token so the
// failure is invisible to the caller.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      // `_retry` caps this at a single attempt: if the replayed request also
      // 401s we fall through and reject, rather than looping forever.
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshOnce();

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Only tear down the session when the refresh was rejected *as an auth
        // failure*. A network blip or timeout during refresh must not log the
        // user out — their tokens may still be perfectly valid.
        let isAuthRejection = refreshError instanceof SessionExpiredError;

        if (isAxiosError(refreshError)) {
          const status = refreshError.response?.status;
          isAuthRejection = status === 401 || status === 403;
        }

        if (isAuthRejection) {
          // Best-effort cleanup: swallow storage errors so a failed delete
          // can't mask the original auth failure we're propagating.
          await SecureStore.deleteItemAsync("accessToken").catch(() => {});
          await SecureStore.deleteItemAsync("refreshToken").catch(() => {});
          onAuthFailure?.();
        }

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
