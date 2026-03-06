import OAuthButton from "@/components/auth/oauthButton";
import * as WebBrowser from "expo-web-browser";
import { useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Ensure the browser session completes properly
WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const fadeGoogle = useRef(new Animated.Value(1)).current;
  const fadeFacebook = useRef(new Animated.Value(1)).current;

  const handleOAuthLogin = async (provider: "google" | "facebook") => {
    const backendUrl = `https://dev-backend.anthonyostia.com/auth/${provider}`;
    await WebBrowser.openAuthSessionAsync(
      backendUrl,
      "castaway://auth/callback",
    );
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
