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
        console.log("Restoring session...");
        const storedToken = await SecureStore.getItemAsync("accessToken");
        if (storedToken) {
          setAccessToken(storedToken);
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
      } finally {
        console.log("Session restore complete");
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (token: string, refreshToken: string) => {
    await SecureStore.setItemAsync("accessToken", token);
    await SecureStore.setItemAsync("refreshToken", refreshToken);
    setAccessToken(token);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!accessToken,
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
