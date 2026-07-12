import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Space between the toast and whatever sits below it (tab bar / mini-player).
const GAP = 12;

interface ToastProps {
  message: string;
  visible: boolean;
  /** Height of the UI below the toast; the toast floats `GAP` above it. */
  bottomInset: number;
}

/**
 * The presentational toast: a message pill that fades and slides in/out.
 *
 * @remarks
 * Purely driven by props — {@link ToastProvider} owns the message, visibility,
 * and auto-hide timing. `pointerEvents="none"` so it never intercepts taps meant
 * for the UI beneath it, and it's positioned off `bottomInset` so it clears the
 * tab bar and mini-player rather than overlapping them.
 */
const Toast = ({ message, visible, bottomInset }: ToastProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  // Fade + rise on show, reverse on hide; slightly quicker out than in.
  useEffect(() => {
    const duration = visible ? 260 : 200;
    opacity.value = withTiming(visible ? 1 : 0, { duration });
    translateY.value = withTiming(visible ? 0 : 16, { duration });
  }, [visible, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { bottom: bottomInset + GAP }, animatedStyle]}
    >
      <Text style={styles.text} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      left: 12,
      right: 12,
      // Inverse surface so the toast contrasts with the app in both themes.
      backgroundColor: colors.inverseSurface,
      borderRadius: 8,
      paddingVertical: 16,
      paddingHorizontal: 16,
      alignItems: "center",
      // Shadows are cast as black regardless of theme (opacity does the work)
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    text: {
      color: colors.onInverse,
      fontSize: 15,
      fontWeight: "600",
      textAlign: "center",
    },
  });

export default Toast;
