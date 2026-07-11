import { ThemeColors } from "@/constants/theme";
import { getContrastPalette } from "@/utils/contrast";
import { useEffect } from "react";
import {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export const usePlayerForeground = (
  coverColor: string | undefined,
  colors: ThemeColors,
  duration = 300,
) => {
  const progress = useSharedValue(coverColor ? 1 : 0);

  const palette = coverColor
    ? getContrastPalette(coverColor)
    : { primary: colors.primary, secondary: colors.secondary };

  const fromPrimary = colors.primary;
  const toPrimary = palette.primary;
  const fromSecondary = colors.secondary;
  const toSecondary = palette.secondary;

  useEffect(() => {
    progress.value = coverColor ? withTiming(1, { duration }) : 0;
  }, [coverColor, duration, progress]);

  const primaryTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [fromPrimary, toPrimary]),
  }));

  const secondaryTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [fromSecondary, toSecondary],
    ),
  }));

  const primaryBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [fromPrimary, toPrimary],
    ),
  }));

  const secondaryBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [fromSecondary, toSecondary],
    ),
  }));

  return {
    palette,
    primaryTextStyle,
    secondaryTextStyle,
    primaryBgStyle,
    secondaryBgStyle,
  };
};
