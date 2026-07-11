import { useEffect } from "react";
import { BackHandler } from "react-native";

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
