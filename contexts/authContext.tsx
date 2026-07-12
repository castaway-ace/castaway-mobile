import { useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import apiClient, { setAuthFailureHandler } from "@/api/client";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextValue {
  user: User | null;
  /** Derived from `user`; the single flag screens gate on to show auth vs app. */
  isAuthenticated: boolean;
  /** True only during the initial session restore, so the app can hold a splash. */
  isLoading: boolean;
  logIn: (accessToken: string, refreshToken: string) => Promise<void>;
  signUp: (accessToken: string, refreshToken: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const storeTokens = async (tokens: AuthTokens): Promise<void> => {
  await SecureStore.setItemAsync("accessToken", tokens.accessToken);
  await SecureStore.setItemAsync("refreshToken", tokens.refreshToken);
};

// Best-effort clear: ignore delete failures so logout/teardown always completes
// even if one key is already gone.
const clearTokens = async (): Promise<void> => {
  await SecureStore.deleteItemAsync("accessToken").catch(() => {});
  await SecureStore.deleteItemAsync("refreshToken").catch(() => {});
};

/**
 * Owns authentication state for the whole app: the current user, session
 * bootstrap, and the login/signup/logout transitions.
 *
 * @remarks
 * Tokens live in secure storage (read by {@link apiClient}); this provider holds
 * only the derived user profile in memory. It also bridges the low-level client
 * back to React — registering the handler the client calls when a refresh fails
 * — which is why the client exposes an injection point rather than importing
 * this context (see {@link setAuthFailureHandler}), avoiding a dependency cycle.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore a session on cold start: if a token is stored, fetch the profile it
  // belongs to. Any failure (no token, expired, offline) is swallowed and simply
  // leaves the user logged out — startup must never hang on this. `cancelled`
  // guards against setting state if the provider unmounts mid-request, and
  // `isLoading` is cleared in `finally` so the app always leaves the splash.
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        if (!token) {
          return;
        }
        const { data } = await apiClient.get<User>("/user/me");
        if (!cancelled) {
          setUser(data);
        }
      } catch {
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  // Wire this provider into the API client: when a token refresh fails
  // irrecoverably, drop the user and wipe cached data so the app falls back to
  // sign-in with nothing stale left behind. Cleared on unmount to avoid holding
  // a stale closure.
  useEffect(() => {
    setAuthFailureHandler(() => {
      setUser(null);
      queryClient.clear();
    });
    return () => setAuthFailureHandler(null);
  }, [queryClient]);

  // Login and signup are identical from here on — persist the tokens the auth
  // endpoint returned, then load the profile — so both share one implementation.
  const establishSession = useCallback(
    async (accessToken: string, refreshToken: string): Promise<void> => {
      await storeTokens({ accessToken, refreshToken });
      const { data } = await apiClient.get<User>("/user/me");
      setUser(data);
    },
    [],
  );

  const logIn = establishSession;
  const signUp = establishSession;

  const logOut = useCallback(async (): Promise<void> => {
    // Tell the server first (best effort — a failed/offline logout must not trap
    // the user in the app), then tear down local session state regardless.
    try {
      await apiClient.post("/auth/logout");
    } catch {}
    await clearTokens();
    setUser(null);
    // Wipe the query cache so the next account that signs in on this device can't
    // read the previous user's data.
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      logIn,
      signUp,
      logOut,
    }),
    [user, isLoading, logIn, signUp, logOut],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

/**
 * Accessor for auth state and session actions.
 *
 * @throws {Error} When used outside {@link AuthProvider} — fails fast rather than
 * returning an undefined context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
