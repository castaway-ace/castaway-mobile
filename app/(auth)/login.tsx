import OAuthButton from "@/components/auth/oauthButton";
import { useAuth } from "@/contexts/auth-context";
import * as WebBrowser from "expo-web-browser";
import { useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Ensure the browser session completes properly
WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const { login } = useAuth();

  const fadeGoogle = useRef(new Animated.Value(1)).current;
  const fadeFacebook = useRef(new Animated.Value(1)).current;

  const handleOAuthLogin = async (provider: "google" | "facebook") => {
    const backendUrl = `http://dev-backend.anthonyostia.com/auth/${provider}`;
    const redirectUri = "castaway://auth/callback";

    try {
      const result = await WebBrowser.openAuthSessionAsync(
        backendUrl,
        redirectUri,
      );

      if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get("code");

        if (code) {
          // Exchange the authorization code for tokens via your backend
          const tokenResponse = await fetch(
            "http://dev-backend.anthonyostia.com/auth/token",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code }),
            },
          );

          const { accessToken, refreshToken } = await tokenResponse.json();
          await login(accessToken, refreshToken);
        }
      }
    } catch (error) {
      console.error(`${provider} OAuth failed:`, error);
    }
  };

  const handleGoogleLogin = () => {
    handleOAuthLogin("google");
  };

  const handleFacebookLogin = () => {
    handleOAuthLogin("facebook");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <OAuthButton
        provider="google"
        onPress={handleGoogleLogin}
        fadeAnim={fadeGoogle}
      />
      <OAuthButton
        provider="facebook"
        onPress={handleFacebookLogin}
        fadeAnim={fadeFacebook}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 36,
  },
});

export default Login;
