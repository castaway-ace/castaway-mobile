import { ThemeColors } from "@/constants/theme";
import {
  SheetContent,
  SheetType,
  useSheetModal,
} from "@/contexts/sheet-modal-context";
import { useTheme } from "@/contexts/theme-context";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
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
  const sheetHeight = useSharedValue(0);
  const translateY = useSharedValue(height);

  const [displayed, setDisplayed] = useState<SheetContent | null>(null);

  const pendingOpenRef = useRef(false);

  const beginOpen = useCallback((next: SheetContent): void => {
    pendingOpenRef.current = true;
    setDisplayed(next);
  }, []);

  const onSheetLayout = useCallback(
    (event: LayoutChangeEvent): void => {
      const measured = event.nativeEvent.layout.height;
      if (measured <= 0) {
        return;
      }

      sheetHeight.value = measured;

      if (pendingOpenRef.current) {
        pendingOpenRef.current = false;
        translateY.value = measured;
        translateY.value = withTiming(0, { duration: 280 });
      }
    },
    [sheetHeight, translateY],
  );

  useEffect(() => {
    if (active === null) {
      if (displayed !== null) {
        translateY.value = withTiming(
          sheetHeight.value || height,
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
      beginOpen(active);
    } else {
      const next = active;
      translateY.value = withTiming(
        sheetHeight.value || height,
        { duration: 220 },
        (finished) => {
          if (finished) {
            runOnJS(beginOpen)(next);
          }
        },
      );
    }
  }, [active, displayed, height, sheetHeight, translateY, beginOpen]);

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
    translateY.value = withTiming(
      sheetHeight.value || height,
      { duration: 280 },
      (finished) => {
        if (finished) {
          runOnJS(close)();
        }
      },
    );
  });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const span = sheetHeight.value > 0 ? sheetHeight.value : 1;
    return {
      opacity: interpolate(
        translateY.value,
        [0, span],
        [1, 0],
        Extrapolation.CLAMP,
      ),
    };
  });

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
          style={[styles.sheet, sheetStyle]}
          onLayout={onSheetLayout}
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
      paddingBottom: 40,
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
