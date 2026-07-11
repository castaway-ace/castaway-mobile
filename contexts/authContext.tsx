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
  isAuthenticated: boolean;
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

const clearTokens = async (): Promise<void> => {
  await SecureStore.deleteItemAsync("accessToken").catch(() => {});
  await SecureStore.deleteItemAsync("refreshToken").catch(() => {});
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    setAuthFailureHandler(() => {
      setUser(null);
      queryClient.clear();
    });
    return () => setAuthFailureHandler(null);
  }, [queryClient]);

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
    try {
      await apiClient.post("/auth/logout");
    } catch {}
    await clearTokens();
    setUser(null);
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
