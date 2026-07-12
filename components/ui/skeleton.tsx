import { useTheme } from "@/contexts/themeContext";
import { useEffect } from "react";
import { DimensionValue, StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A single pulsing placeholder block, sized by the caller, shown in place of
 * content that is still loading.
 *
 * @remarks
 * The building block for the per-item skeletons: compose several of these to
 * mirror a real item's layout at the same dimensions, so the screen doesn't shift
 * when data arrives. Uses a looping opacity pulse (reanimated only — no extra
 * dependency) rather than a shimmer sweep, and fills with the themed `skeleton`
 * color so it reads correctly in light and dark mode.
 *
 * @param width - Block width; defaults to fill the parent.
 * @param height - Block height (required for the block to be visible).
 * @param borderRadius - Corner radius; match the shape it stands in for (e.g. a
 * circle for a round avatar, a small radius for a text line).
 */
export const Skeleton = ({
  width = "100%",
  height,
  borderRadius = 8,
  style,
}: SkeletonProps) => {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    // Ease between half and full opacity forever; the `true` reverses each cycle
    // so the pulse breathes smoothly instead of snapping back to 0.5.
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: colors.skeleton },
        animatedStyle,
        style,
      ]}
    />
  );
};

export default Skeleton;
