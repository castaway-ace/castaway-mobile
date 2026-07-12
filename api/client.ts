import type { components } from "@/api/schema";
import axios, { AxiosError, isAxiosError } from "axios";
import * as SecureStore from "expo-secure-store";

/**
 * Shared Axios instance for every authenticated backend call.
 *
 * Beyond a configured base URL and timeout, this module owns the token
 * lifecycle so no call site has to think about it: each request is signed with
 * the stored access token, and a `401` transparently triggers a single
 * refresh-and-retry. When the refresh itself is rejected as unauthorized the
 * stored tokens are cleared and the registered auth-failure handler runs,
 * returning the user to sign-in.
 *
 * @packageDocumentation
 */

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Augment Axios' request config with a per-request flag the response
// interceptor uses to guarantee a request is only ever retried once (see the
// refresh flow below). Declared here so it travels with the client that relies
// on it.
declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

type RefreshResponse = components["schemas"]["AuthTokensEntity"];

/**
 * Signals that the session is genuinely over — no refresh token is stored, or
 * the backend rejected the one we hold.
 *
 * @remarks
 * Distinguished from generic/transport errors so the interceptor can log the
 * user out only on a real authentication failure, and leave transient network
 * faults to bubble up untouched.
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

// Single in-flight refresh shared by all callers. Multiple requests can fail
// with 401 at once (e.g. a screen firing several queries); funnelling them
// through one promise means we hit `/auth/refresh` exactly once and avoid
// racing writes to secure storage.
let refreshPromise: Promise<string> | null = null;

let onAuthFailure: (() => void) | null = null;

/**
 * Registers the callback fired when a refresh fails irrecoverably (the session
 * is over), or clears it with `null`.
 *
 * @remarks
 * Held as module state, and injected rather than imported, so this low-level
 * client never depends on React or the auth context. The auth provider wires
 * itself in on mount and clears the handler on unmount, which keeps the
 * dependency arrow pointing one way (auth → client, never the reverse).
 *
 * @param handler - Invoked with no arguments on terminal auth failure.
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
        // Reuse the in-flight refresh if one is already running; otherwise
        // start it and clear the slot once it settles, so the next expiry
        // starts a fresh refresh.
        if (!refreshPromise) {
          refreshPromise = refreshTokens().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;

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
