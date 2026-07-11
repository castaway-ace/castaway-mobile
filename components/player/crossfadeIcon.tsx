import { IconSymbol } from "@/components/ui/iconSymbol";
import { ComponentProps, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import { COLOR_TRANSITION_DURATION } from "@/constants/player";

type Props = ComponentProps<typeof IconSymbol> & {
  duration?: number;
};

export const CrossfadeIcon = ({
  color,
  duration = COLOR_TRANSITION_DURATION,
  ...iconProps
}: Props) => {
  const [layers, setLayers] = useState({ from: color, to: color });
  const progress = useSharedValue(1);

  useEffect(() => {
    if (color === layers.to) return;
    setLayers((current) => ({ from: current.to, to: color }));
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
      <IconSymbol
        {...iconProps}
        color={transitioning ? layers.from : layers.to}
      />
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
