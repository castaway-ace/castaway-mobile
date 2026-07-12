import { ThemeColors } from "@/constants/theme";
import {
  SheetContent,
  SheetType,
  useSheetModal,
} from "@/contexts/sheetModalContext";
import { useTheme } from "@/contexts/themeContext";
import { useBackHandler } from "@/utils/useBackHandler";
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
import NowPlayingContent from "./nowPlayingContent";
import PlaylistContent from "./playlistContent";
import PlaylistSelectContent from "./playlistSelectContent";
import PlaylistTrackContent from "./playlistTrackContent";

/**
 * Host for the app's single bottom sheet — the animated container and gesture
 * layer around whichever {@link SheetContent} variant is active.
 *
 * @remarks
 * The sheet's height is content-driven and unknown until it lays out, so opening
 * is a two-step dance: mount the content, then in `onLayout` learn its height and
 * slide it up from exactly that far. `displayed` deliberately lags `active` so
 * the sheet stays mounted through its slide-out, and swapping between two sheet
 * types animates the old one out before the new one in rather than cutting.
 */
const SheetModal: FC = () => {
  const { colors } = useTheme();
  const { active, close } = useSheetModal();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  useBackHandler(active !== null, close);

  const { height } = useWindowDimensions();
  // Measured content height; the slide distance. Starts 0 until first layout.
  const sheetHeight = useSharedValue(0);
  const translateY = useSharedValue(height);

  // Trails `active`: stays set during the close
  // animation so content doesn't vanish before the sheet finishes sliding away.
  const [displayed, setDisplayed] = useState<SheetContent | null>(null);

  // Marks content mounted but not yet animated in — the entrance is deferred to
  // `onSheetLayout` because we can't slide up until we know how tall it is.
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

      // First layout after a `beginOpen`: park the sheet just off-screen at its
      // real height, then animate it up. Doing this here (not on mount) avoids a
      // flash where the sheet jumps from a guessed height to its true one.
      if (pendingOpenRef.current) {
        pendingOpenRef.current = false;
        translateY.value = measured;
        translateY.value = withTiming(0, { duration: 280 });
      }
    },
    [sheetHeight, translateY],
  );

  useEffect(() => {
    // Closing: slide down (using the last known height, falling back to screen
    // height) and only then drop the content from the tree.
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

    // Re-opening the same variant is a no-op — don't re-animate.
    const sameContent = displayed !== null && displayed.type === active.type;

    if (sameContent) {
      return;
    }

    if (displayed === null) {
      // Nothing showing: mount and let `onSheetLayout` animate it in.
      beginOpen(active);
    } else {
      // Switching variants: slide the current sheet out first, then open the new
      // one on completion so the two transitions don't overlap.
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
      // Follow the finger downward only — the sheet can't be dragged past open.
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      // Commit the dismiss on a far-enough drag or a fast flick; else spring back.
      const shouldClose =
        event.translationY > height * 0.2 || event.velocityY > 900;
      if (shouldClose) {
        runOnJS(close)();
      } else {
        translateY.value = withTiming(0, { duration: 220 });
      }
    });

  // Tapping the dimmed backdrop slides the sheet away, then closes.
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

  // Fade the backdrop in lockstep with the slide: fully dark when open
  // (translateY 0), fully clear when the sheet has travelled its own height.
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
          {/* Render the content variant that matches the active sheet type. The
              discriminated union narrows `displayed` so each child receives its
              exact content shape. */}
          {displayed.type === SheetType.PLAYLIST && (
            <PlaylistContent content={displayed} />
          )}
          {displayed.type === SheetType.ALBUM_TRACK && (
            <AlbumTrackContent content={displayed} />
          )}
          {displayed.type === SheetType.PLAYLIST_TRACK && (
            <PlaylistTrackContent content={displayed} />
          )}
          {displayed.type === SheetType.PLAYLIST_SELECT && (
            <PlaylistSelectContent trackId={displayed.trackId} />
          )}
          {displayed.type === SheetType.NOW_PLAYING && <NowPlayingContent />}
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
