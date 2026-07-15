import { PopupContent, usePopupModal } from "@/contexts/popupModalContext";
import { useTheme } from "@/contexts/themeContext";
import { useBackHandler } from "@/utils/useBackHandler";
import { FC, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import ConfirmContent from "./confirmContent";
import CreatePlaylistContent from "./createPlaylistContent";
import { makePopupStyles } from "./popupStyles";

/**
 * Host for the app's single centered popup — renders the active
 * {@link PopupContent} variant over a dismiss-on-tap backdrop.
 *
 * @remarks
 * The centered counterpart to {@link SheetModal}. Both fade their backdrop in
 * lockstep with the card, but a centered dialog needs no layout measurement, so
 * one `progress` value drives everything instead of a measured slide. Like the
 * sheet, `displayed` deliberately lags `content` to keep the dialog mounted
 * through its exit. Tapping the backdrop or pressing Android back closes it; the
 * inner content owns its own buttons.
 */
const PopupModal: FC = () => {
  const { colors } = useTheme();
  const { content, close } = usePopupModal();
  const styles = useMemo(() => makePopupStyles(colors), [colors]);

  useBackHandler(content !== null, close);

  const progress = useSharedValue(0);

  const [displayed, setDisplayed] = useState<PopupContent | null>(null);

  useEffect(() => {
    if (content === null) {
      progress.value = withTiming(0, { duration: 220 }, (finished) => {
        if (finished) {
          runOnJS(setDisplayed)(null);
        }
      });
      return;
    }

    setDisplayed(content);
    progress.value = withTiming(1, { duration: 280 });
  }, [content, progress]);

  const tapBackdrop = Gesture.Tap().onEnd(() => {
    runOnJS(close)();
  });

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 1],
          [0.92, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  if (displayed === null) return null;

  return (
    <View
      style={styles.container}
      pointerEvents={content === null ? "none" : "auto"}
    >
      <GestureDetector gesture={tapBackdrop}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </GestureDetector>
      <Animated.View style={[styles.card, cardStyle]}>
        {displayed.variant === "createPlaylist" && (
          <CreatePlaylistContent trackId={displayed.trackId} />
        )}
        {displayed.variant === "confirm" && (
          <ConfirmContent content={displayed} />
        )}
      </Animated.View>
    </View>
  );
};

export default PopupModal;
