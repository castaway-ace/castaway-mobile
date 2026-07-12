import { useTheme } from "@/contexts/themeContext";
import { FC, useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { usePlayerModal } from "@/contexts/playerModalContext";
import { useBackHandler } from "@/utils/useBackHandler";
import { useAnimatedBackground } from "../useAnimatedBackground";
import MusicPlayerModalContent from "./content";

/**
 * The full-screen now-playing player, presented as a slide-up sheet.
 *
 * @remarks
 * Visibility is owned by {@link usePlayerModal}; this component animates in/out
 * and hosts the shared drag-to-dismiss gesture. It mounts lazily and unmounts
 * only after the exit animation completes, so the expensive content isn't in the
 * tree while the player is closed.
 */
const MusicPlayerModal: FC = () => {
  const { colors } = useTheme();
  const { isOpen, close } = usePlayerModal();
  const { coverColor } = useAudioPlayerContext();

  const backgroundStyle = useAnimatedBackground(coverColor, colors.background);

  // Decouples "should be visible" (isOpen) from "is in the tree" (rendered):
  // stays mounted through the closing animation, then removed on completion.
  const [rendered, setRendered] = useState(false);

  const { height } = useWindowDimensions();
  // Off-screen (one full height down) by default; 0 is fully open.
  const translateY = useSharedValue(height);

  // Mount synchronously during render on open so the entrance animation has a
  // node to run against on the very next frame (no dropped opening frame).
  if (isOpen && !rendered) {
    setRendered(true);
  }

  useEffect(() => {
    if (isOpen) {
      translateY.value = withTiming(0, { duration: 280 });
    } else {
      // Slide down, then unmount once settled.
      translateY.value = withTiming(height, { duration: 220 }, (finished) => {
        if (finished) {
          runOnJS(setRendered)(false);
        }
      });
    }
  }, [isOpen, height, translateY]);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      // Track the finger, but only downward — the sheet can't be dragged above
      // its open position.
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      // Commit the dismiss on a far-enough drag OR a fast flick, so a quick
      // short swipe still closes it; otherwise spring back to open.
      const shouldClose =
        event.translationY > height * 0.2 || event.velocityY > 900;
      if (shouldClose) {
        runOnJS(close)();
      } else {
        translateY.value = withTiming(0, { duration: 220 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Android hardware back closes the player instead of leaving the screen.
  useBackHandler(isOpen, close);

  if (!rendered) {
    return null;
  }

  return (
    // box-none: the full-screen wrapper itself is transparent to touches so the
    // UI behind it stays interactive; only the sheet captures gestures.
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.sheet, animatedStyle, backgroundStyle]}
        >
          <MusicPlayerModalContent />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    ...StyleSheet.absoluteFill,
  },
});

export default MusicPlayerModal;
