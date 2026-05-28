import * as SecureStore from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import apiClient, { setAuthFailureHandler } from "../api/client";

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
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  logIn: (token: string, refreshToken: string) => Promise<void>;
  signUp: (token: string, refreshToken: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function storeTokens(tokens: AuthTokens): Promise<void> {
  await SecureStore.setItemAsync("accessToken", tokens.accessToken);
  await SecureStore.setItemAsync("refreshToken", tokens.refreshToken);
}

async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync("accessToken").catch(() => {});
  await SecureStore.deleteItemAsync("refreshToken").catch(() => {});
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        if (!token) {
          return;
        }
        const { data } = await apiClient.get<User>("/user/me");
        if (!cancelled) {
          setAccessToken(token);
          setUser(data);
        }
      } catch {
        if (!cancelled) {
          await clearTokens();
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setAuthFailureHandler(() => {
      setUser(null);
    });
    return () => setAuthFailureHandler(null);
  }, []);

  const logIn = useCallback(
    async (accessToken: string, refreshToken: string) => {
      await storeTokens({ accessToken, refreshToken });
      const { data } = await apiClient.get<User>("/user/me");
      setUser(data);
    },
    [],
  );

  const signUp = useCallback(
    async (accessToken: string, refreshToken: string) => {
      await storeTokens({ accessToken, refreshToken });
      const { data } = await apiClient.get<User>("/user/me");
      setUser(data);
    },
    [],
  );

  const logOut = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {}
    await clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: user !== null,
        isLoading,
        logIn,
        signUp,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
