// components/slide-up-modal.tsx
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  backgroundColor: string;
}

const Modal = ({ visible, onClose, children, backgroundColor }: ModalProps) => {
  const { height } = useWindowDimensions();
  const translateY = useSharedValue(height);
  const [rendered, setRendered] = useState(false);

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      translateY.value = withTiming(0, { duration: 280 });
    } else {
      translateY.value = withTiming(height, { duration: 220 }, (finished) => {
        if (finished) {
          runOnJS(setRendered)(false);
        }
      });
    }
  }, [visible, height, translateY]);

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
        runOnJS(onClose)();
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
          style={[styles.sheet, { backgroundColor }, animatedStyle]}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    sheet: {
      ...StyleSheet.absoluteFill,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
  });

export default Modal;
