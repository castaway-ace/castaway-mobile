import { usePopupModal } from "@/contexts/popupModalContext";
import { useTheme } from "@/contexts/themeContext";
import { useBackHandler } from "@/utils/useBackHandler";
import { FC, useMemo } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import ConfirmContent from "./confirmContent";
import CreatePlaylistContent from "./createPlaylistContent";
import { makePopupStyles } from "./popupStyles";

/**
 * Host for the app's single centered popup — renders the active
 * {@link PopupContent} variant over a dismiss-on-tap backdrop.
 *
 * @remarks
 * The centered counterpart to {@link SheetModal}. It's simpler because these
 * dialogs don't slide or measure: it just shows/hides. Tapping the backdrop or
 * pressing Android back closes it; the inner content owns its own buttons.
 */
const PopupModal: FC = () => {
  const { colors } = useTheme();
  const { content, close } = usePopupModal();
  const styles = useMemo(() => makePopupStyles(colors), [colors]);

  useBackHandler(content !== null, close);

  const tapBackdrop = Gesture.Tap().onEnd(() => {
    runOnJS(close)();
  });

  if (content === null) return null;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={tapBackdrop}>
        <Animated.View style={styles.backdrop} />
      </GestureDetector>
      {/* Render the matching variant; the union narrows `content` for each child. */}
      {content.variant === "createPlaylist" && (
        <CreatePlaylistContent trackId={content.trackId} />
      )}
      {content.variant === "confirm" && <ConfirmContent content={content} />}
    </View>
  );
};

export default PopupModal;
