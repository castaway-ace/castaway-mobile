import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_HEIGHT = 72;
const MINI_PLAYER_HEIGHT = 84;
const GAP = 12;

interface ToastProps {
  message: string;
  visible: boolean;
}

const Toast = ({ message, visible }: ToastProps) => {
  const insets = useSafeAreaInsets();
  const { currentTrack } = useAudioPlayerContext();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    const duration = visible ? 260 : 200;
    opacity.value = withTiming(visible ? 1 : 0, { duration });
    translateY.value = withTiming(visible ? 0 : 16, { duration });
  }, [visible, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const bottom =
    insets.bottom +
    TAB_BAR_HEIGHT +
    (currentTrack ? MINI_PLAYER_HEIGHT : 0) +
    GAP;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { bottom }, animatedStyle]}
    >
      <Text style={styles.text} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    backgroundColor: "#282828",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default Toast;
