import * as Haptics from "expo-haptics";
import { BottomTabBarButtonProps } from "expo-router/js-tabs";
import { PlatformPressable } from "expo-router/react-navigation";

/**
 * Drop-in replacement for the default tab-bar button that adds platform-native
 * press feedback: a light haptic tap on iOS and a ripple on Android.
 *
 * @remarks
 * Passed to the navigator as its `tabBarButton`, so it must forward every prop
 * (including the original `onPressIn`) straight through to
 * {@link PlatformPressable} to preserve default navigation behavior.
 */
export const HapticTab = (props: BottomTabBarButtonProps) => {
  return (
    <PlatformPressable
      {...props}
      android_ripple={{ radius: 40, borderless: true }}
      onPressIn={(ev) => {
        // Haptics are iOS-only here; Android gets the ripple above instead.
        if (process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
};
