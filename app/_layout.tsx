import { AudioPlayerProvider } from "@/contexts/audio-player-context";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { PlayerModalProvider } from "@/contexts/player-modal-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { ModalProvider } from "../contexts/modal-context";
import ThemeProvider from "../contexts/theme-context";

const queryClient = new QueryClient();

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const hasAccess = isAuthenticated;

    if (!hasAccess && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (hasAccess && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, isLoading, router, segments]);

  if (isLoading) {
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
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
};

const RootLayout = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <AudioPlayerProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <PlayerModalProvider>
                <ModalProvider>
                  <RootNavigator />
                </ModalProvider>
              </PlayerModalProvider>
            </GestureHandlerRootView>
          </AudioPlayerProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;
