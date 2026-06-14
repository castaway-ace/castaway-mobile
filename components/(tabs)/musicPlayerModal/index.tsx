import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { FC, useEffect, useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import { usePlayerModal } from "../../../contexts/player-modal-context";
import MusicPlayerModalContent from "./content";

const MusicPlayerModal: FC = () => {
  const { colors } = useTheme();
  const { isOpen, close } = usePlayerModal();

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [rendered, setRendered] = useState(false);

  const { height } = useWindowDimensions();
  const translateY = useSharedValue(height);

  if (isOpen && !rendered) {
    setRendered(true);
  }

  useEffect(() => {
    if (isOpen) {
      translateY.value = withTiming(0, { duration: 280 });
    } else {
      translateY.value = withTiming(height, { duration: 220 }, (finished) => {
        if (finished) {
          runOnJS(setRendered)(false);
        }
      });
    }
  }, [isOpen, height, translateY]);

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!rendered) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.background },
            animatedStyle,
          ]}
        >
          <MusicPlayerModalContent />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    sheet: {
      ...StyleSheet.absoluteFill,
    },
  });

export default MusicPlayerModal;
