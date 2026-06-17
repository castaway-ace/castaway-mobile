import { ThemeColors } from "@/constants/theme";
import {
  SheetContent,
  SheetType,
  useSheetModal,
} from "@/contexts/sheet-modal-context";
import { useTheme } from "@/contexts/theme-context";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
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
import AlbumTrackContent from "./albumTrackContent";
import PlaylistContent from "./playlistContent";
import PlaylistTrackContent from "./playlistTrackContent";

const SheetModal: FC = () => {
  const { colors } = useTheme();
  const { active, close } = useSheetModal();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { height } = useWindowDimensions();
  const sheetHeight = height * 0.45;
  const translateY = useSharedValue(sheetHeight);

  const [displayed, setDisplayed] = useState<SheetContent | null>(null);

  const swapAndOpen = useCallback(
    (next: SheetContent): void => {
      setDisplayed(next);
      translateY.value = withTiming(0, { duration: 280 });
    },
    [translateY],
  );

  useEffect(() => {
    if (active === null) {
      if (displayed !== null) {
        translateY.value = withTiming(
          sheetHeight,
          { duration: 220 },
          (finished) => {
            if (finished) {
              runOnJS(setDisplayed)(null);
            }
          },
        );
      }
      return;
    }

    const sameContent = displayed !== null && displayed.type === active.type;

    if (sameContent) {
      return;
    }

    if (displayed === null) {
      swapAndOpen(active);
    } else {
      const next = active;
      translateY.value = withTiming(
        sheetHeight,
        { duration: 220 },
        (finished) => {
          if (finished) {
            runOnJS(swapAndOpen)(next);
          }
        },
      );
    }
  }, [active, displayed, sheetHeight, translateY, swapAndOpen]);

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

  if (displayed === null) {
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
          {displayed.type === SheetType.ALBUM && <AlbumTrackContent />}
          {displayed.type === SheetType.PLAYLIST && <PlaylistTrackContent />}
          {displayed.type === SheetType.PLAYLIST_SELECT && (
            <PlaylistContent trackId={displayed.trackId} />
          )}
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
      backgroundColor: colors.primary,
    },
  });

export default SheetModal;
