import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/**
 * Animated background color for the players. It sits on a neutral `muteColor`
 * (white/black) base whenever there's no cover color yet — e.g. right when a new
 * song loads — and then quickly fades to `color` once it's been extracted.
 */
export const useAnimatedBackground = (
  color: string | undefined,
  muteColor: string,
  duration = 300,
) => {
  const background = useSharedValue(color ?? muteColor);

  useEffect(() => {
    if (color) {
      background.value = withTiming(color, { duration });
    } else {
      // Reset to the mute base immediately on a song change.
      background.value = muteColor;
    }
  }, [color, muteColor, duration, background]);

  return useAnimatedStyle(() => ({
    backgroundColor: background.value,
  }));
};
