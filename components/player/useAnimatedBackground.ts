import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { COLOR_TRANSITION_DURATION } from "@/constants/player";

export const useAnimatedBackground = (
  color: string | undefined,
  muteColor: string,
  duration = COLOR_TRANSITION_DURATION,
) => {
  const background = useSharedValue(color ?? muteColor);

  useEffect(() => {
    if (color) {
      background.value = withTiming(color, { duration });
    }
  }, [color, duration, background]);

  return useAnimatedStyle(() => ({
    backgroundColor: background.value,
  }));
};
