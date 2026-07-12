import { useEffect } from "react";
import { BackHandler } from "react-native";

/**
 * Runs `onBack` on the Android hardware back press while `enabled`.
 *
 * @remarks
 * Used by overlays (sheets, the player modal) so back dismisses the overlay
 * instead of navigating away. Returning `true` from the listener tells Android
 * the press was handled, suppressing the default behavior; the listener is only
 * registered while `enabled`, so a closed overlay never intercepts back. No-op on
 * platforms without a hardware back button.
 *
 * @param enabled - Whether to intercept back right now (typically the overlay's open state).
 * @param onBack - Handler invoked on back press.
 */
export const useBackHandler = (enabled: boolean, onBack: () => void) => {
  useEffect(() => {
    if (!enabled) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onBack();
        return true;
      },
    );
    return () => subscription.remove();
  }, [enabled, onBack]);
};
