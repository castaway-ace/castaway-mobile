import { ThemeColors } from "@/constants/theme";
import { getContrastPalette } from "@/utils/contrast";
import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { COLOR_TRANSITION_DURATION } from "@/constants/player";

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
