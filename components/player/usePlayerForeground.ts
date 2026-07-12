import { ThemeColors } from "@/constants/theme";
import { getContrastPalette } from "@/utils/contrast";
import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { COLOR_TRANSITION_DURATION } from "@/constants/player";

/**
 * Derives the player's foreground colors (text and controls) from the cover
 * color and returns animated styles that ease between them as tracks change.
 *
 * @remarks
 * The backdrop is the cover color (see {@link useAnimatedBackground}), so
 * foreground colors can't be fixed theme values or they'd wash out against some
 * covers. {@link getContrastPalette} picks primary/secondary tones that stay
 * legible on that backdrop; when no cover color is known yet it falls back to the
 * theme's own text colors. Both the raw `palette` (for non-animated consumers
 * like plain icon colors) and pre-built animated text/background styles are
 * returned so callers don't each re-wire the same shared values.
 *
 * @param coverColor - Extracted cover color, or `undefined` before extraction.
 * @param colors - Active theme palette, used as the fallback.
 * @param duration - Transition length in ms.
 */
export const usePlayerForeground = (
  coverColor: string | undefined,
  colors: ThemeColors,
  duration = COLOR_TRANSITION_DURATION,
) => {
  const palette = coverColor
    ? getContrastPalette(coverColor)
    : { primary: colors.primary, secondary: colors.secondary };

  const primary = useSharedValue(palette.primary);
  const secondary = useSharedValue(palette.secondary);

  // Ease to the new contrast colors whenever the cover (and thus palette) changes.
  useEffect(() => {
    primary.value = withTiming(palette.primary, { duration });
    secondary.value = withTiming(palette.secondary, { duration });
  }, [palette.primary, palette.secondary, duration, primary, secondary]);

  const primaryTextStyle = useAnimatedStyle(() => ({
    color: primary.value,
  }));

  const secondaryTextStyle = useAnimatedStyle(() => ({
    color: secondary.value,
  }));

  const primaryBgStyle = useAnimatedStyle(() => ({
    backgroundColor: primary.value,
  }));

  const secondaryBgStyle = useAnimatedStyle(() => ({
    backgroundColor: secondary.value,
  }));

  return {
    palette,
    primaryTextStyle,
    secondaryTextStyle,
    primaryBgStyle,
    secondaryBgStyle,
  };
};
