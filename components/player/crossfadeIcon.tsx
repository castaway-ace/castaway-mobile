import { IconSymbol } from "@/components/ui/iconSymbol";
import { COLOR_TRANSITION_DURATION } from "@/constants/player";
import { ComponentProps, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

type Props = ComponentProps<typeof IconSymbol> & {
  duration?: number;
};

/**
 * An {@link IconSymbol} that smoothly fades between colors when its `color` prop
 * changes — used throughout the player so icons tint with the album artwork
 * instead of snapping.
 *
 * @remarks
 * A vector icon's `color` can't be animated directly: wrapping the icon font in
 * reanimated's `createAnimatedComponent` yields `undefined` at runtime in v4. So
 * this crossfades two *statically* colored copies instead — the old color
 * underneath, the new color faded in on top — which is the supported way to get
 * an animated color change out of an icon.
 *
 * The `layers` state machine drives it: on a color change the current color
 * becomes `from`, the new one `to`, and opacity animates 0→1. When the fade
 * finishes both collapse back to the same color so only a single icon renders
 * (no wasted overlay) until the next change.
 */
export const CrossfadeIcon = ({
  color,
  duration = COLOR_TRANSITION_DURATION,
  ...iconProps
}: Props) => {
  const [layers, setLayers] = useState({ from: color, to: color });
  const progress = useSharedValue(1);

  useEffect(() => {
    // Already showing this color — nothing to animate.
    if (color === layers.to) return;
    // Fade from whatever is currently on top toward the new color.
    setLayers((current) => ({ from: current.to, to: color }));
    // Reset to fully transparent, then drive the incoming layer in. On
    // completion, collapse both layers to the settled color so the overlay
    // unmounts until the next change.
    progress.value = 0;
    progress.value = withTiming(1, { duration }, (finished) => {
      if (finished) {
        runOnJS(setLayers)({ from: color, to: color });
      }
    });
  }, [color, layers.to, duration, progress]);

  const incomingStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  const transitioning = layers.from !== layers.to;

  return (
    <View>
      {/* Base layer holds the outgoing color during a fade, the settled color otherwise. */}
      <IconSymbol
        {...iconProps}
        color={transitioning ? layers.from : layers.to}
      />
      {/* Overlay (incoming color) only exists mid-fade; non-interactive so it never eats taps. */}
      {transitioning ? (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, incomingStyle]}
        >
          <IconSymbol {...iconProps} color={layers.to} />
        </Animated.View>
      ) : null}
    </View>
  );
};
