import { ThemeColors } from "@/constants/theme";
import { usePlaylistModal } from "@/contexts/playlist-modal-context";
import { useTheme } from "@/contexts/theme-context";
import { FC, useEffect, useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import PlaylistContent from "./playlistContent";

const PlaylistModal: FC = () => {
  const { colors } = useTheme();
  const { isOpen, close } = usePlaylistModal();

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [rendered, setRendered] = useState(false);

  const { height } = useWindowDimensions();
  const sheetHeight = height * 0.45;
  const translateY = useSharedValue(height);

  if (isOpen && !rendered) {
    setRendered(true);
  }

  useEffect(() => {
    if (isOpen) {
      translateY.value = withTiming(0, { duration: 280 });
    } else {
      translateY.value = withTiming(
        sheetHeight,
        { duration: 220 },
        (finished) => {
          if (finished) {
            runOnJS(setRendered)(false);
          }
        },
      );
    }
  }, [isOpen, sheetHeight, translateY]);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      const shouldClose =
        event.translationY > height * 0.2 || event.velocityY > 900;
      if (shouldClose) {
        runOnJS(close)();
      } else {
        translateY.value = withTiming(0, { duration: 220 });
      }
    });

  const tapBackdrop = Gesture.Tap().onEnd(() => {
    runOnJS(close)();
  });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, sheetHeight],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  if (!rendered) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <GestureDetector gesture={tapBackdrop}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </GestureDetector>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.sheet, { height: sheetHeight }, sheetStyle]}
        >
          <View style={styles.handle} />
          <PlaylistContent />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    sheet: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      overflow: "hidden",
      backgroundColor: colors.background,
    },
    handle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      marginTop: 8,
      marginBottom: 12,
      backgroundColor: "rgba(127, 127, 127, 0.4)",
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      paddingHorizontal: 16,
      color: "#888888",
    },
  });

export default PlaylistModal;
