import { isTokenValid } from "@/utils/auth";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  login: (token: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("accessToken");
        if (storedToken) {
          setAccessToken(storedToken);
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (token: string, refreshToken: string) => {
    try {
      await SecureStore.setItemAsync("accessToken", token);
      await SecureStore.setItemAsync("refreshToken", refreshToken);
      setAccessToken(token);
    } catch (error) {
      console.error("Failed to persist session:", error);
      await SecureStore.deleteItemAsync("accessToken").catch(() => {});
      await SecureStore.deleteItemAsync("refreshToken").catch(() => {});
      setAccessToken(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
    } catch (error) {
      console.error("Failed to clear session:", error);
    } finally {
      setAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isTokenValid(accessToken),
        isLoading,
        accessToken,
        login,
        logout,
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
