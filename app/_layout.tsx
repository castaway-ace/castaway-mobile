import LoadingScreen from "@/components/ui/loadingScreen";
import { AudioPlayerProvider } from "@/contexts/audio-player-context";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { PlayerModalProvider } from "@/contexts/player-modal-context";
import { PopupModalProvider } from "@/contexts/popup-modal.context";
import { SheetModalProvider } from "@/contexts/sheet-modal-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import ThemeProvider from "../contexts/theme-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const inAuthGroup = segments[0] === "(auth)";

  const redirectPending =
    !isLoading &&
    ((!isAuthenticated && !inAuthGroup) || (isAuthenticated && inAuthGroup));

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, isLoading, router, segments]);

  if (isLoading || redirectPending) {
    return <LoadingScreen />;
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
                <SheetModalProvider>
                  <PopupModalProvider>
                    <RootNavigator />
                  </PopupModalProvider>
                </SheetModalProvider>
              </PlayerModalProvider>
            </GestureHandlerRootView>
          </AudioPlayerProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;
