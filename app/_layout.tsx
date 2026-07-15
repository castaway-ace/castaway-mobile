import PlaybackErrorToaster from "@/components/player/playbackErrorToaster";
import LoadingScreen from "@/components/ui/loadingScreen";
import { GC_TIME } from "@/constants/query";
import { AudioPlayerProvider } from "@/contexts/audioPlayerContext";
import { AuthProvider, useAuth } from "@/contexts/authContext";
import { PlayerModalProvider } from "@/contexts/playerModalContext";
import { PopupModalProvider } from "@/contexts/popupModalContext";
import { SheetModalProvider } from "@/contexts/sheetModalContext";
import ThemeProvider from "@/contexts/themeContext";
import { ToastProvider } from "@/contexts/toastContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";

// App-wide query defaults: a 30s baseline stale time (individual queries override
// via STALE_TIME), two retries for transient network failures, and no refetch on
// focus — a mobile app has no window-focus concept and it would refetch on every
// foreground.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: GC_TIME,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Auth gate around the two route groups.
 *
 * @remarks
 * Keeps the visible route in sync with auth state: signed-out users are pushed to
 * `(auth)`, signed-in users out of it. `redirectPending` shows the loading screen
 * during the frame between deciding to redirect and the navigation landing, so
 * the wrong group never flashes. Holds the splash while the session bootstraps
 * (`isLoading`).
 */
const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const inAuthGroup = segments[0] === "(auth)";

  // True when auth state and current group disagree — i.e. a redirect is about
  // to fire and this render shouldn't show either group yet.
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
  }, [isAuthenticated, isLoading, router, inAuthGroup]);

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

/**
 * App root: composes every global provider around the navigator.
 *
 * @remarks
 * Nesting order is deliberate — outer providers are depended on by inner ones.
 * `QueryClientProvider` is outermost because {@link AuthProvider} uses the query
 * client (to clear the cache on logout); the audio player and modal providers sit
 * inside auth/theme so playback and overlays can read them; and the modal
 * providers wrap the navigator so any screen can open a sheet or popup.
 */
const RootLayout = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <AudioPlayerProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <ToastProvider>
                  {/* Inside ToastProvider so it can raise a toast; the audio
                      provider above only records the error. */}
                  <PlaybackErrorToaster />
                  <PlayerModalProvider>
                    <SheetModalProvider>
                      <PopupModalProvider>
                        <RootNavigator />
                      </PopupModalProvider>
                    </SheetModalProvider>
                  </PlayerModalProvider>
                </ToastProvider>
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AudioPlayerProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;
