import { AudioPlayerProvider } from "@/contexts/audio-player-context";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import "react-native-reanimated";

const RootLayout = () => {
  const colorScheme = useColorScheme();
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AudioPlayerProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <StatusBar style="auto" />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
        </ThemeProvider>
      </AudioPlayerProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;
