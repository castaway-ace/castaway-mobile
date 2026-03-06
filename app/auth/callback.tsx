// app/auth/callback.tsx
import { useAuth } from "@/contexts/auth-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

const AuthCallback = () => {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const exchangeCode = async () => {
      if (!code) return;

      try {
        const response = await fetch(
          "https://dev-backend.anthonyostia.com/auth/exchange",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          },
        );

        const data = await response.json();
        console.log("Token response:", JSON.stringify(data));

        if (data.accessToken && data.refreshToken) {
          await login(String(data.accessToken), String(data.refreshToken));
        } else {
          console.error("Unexpected token response shape:", data);
          router.replace("/(auth)/login");
        }
      } catch (error) {
        console.error("Token exchange failed:", error);
        router.replace("/(auth)/login");
      }
    };

    exchangeCode();
  }, [code, login, router]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0f",
      }}
    >
      <ActivityIndicator size="large" color="#c4a1ff" />
    </View>
  );
};

export default AuthCallback;
