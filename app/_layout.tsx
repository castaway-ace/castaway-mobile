import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAudioPlayer } from "expo-audio";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Button, useColorScheme } from "react-native";
import "react-native-reanimated";

const audioSource = require("../assets/hi.mp3");

const RootLayout = () => {
  const colorScheme = useColorScheme();
  const queryClient = new QueryClient();

  const player = useAudioPlayer(audioSource);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar style="auto" />
        <Button title="Play Sound" onPress={() => player.play()} />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;
