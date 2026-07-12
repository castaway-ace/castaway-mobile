import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { COLOR_TRANSITION_DURATION } from "@/constants/player";

/**
 * Animated style whose `backgroundColor` eases toward the current track's cover
 * color — the tinted backdrop shared by the mini-player and full-screen modal.
 *
 * @remarks
 * `withTiming` interpolates between color strings, so assigning the new color
 * animates the transition rather than cutting. Falls back to `muteColor` (the
 * theme background) as the initial value, and only animates once a real cover
 * color arrives, so tracks with no extracted color don't flash to a default.
 *
 * @param color - Target color, typically the extracted cover color; `undefined`
 * until extraction completes.
 * @param muteColor - Neutral fallback used before any color is known.
 * @param duration - Transition length in ms.
 */
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
