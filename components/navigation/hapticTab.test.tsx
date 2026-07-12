import { HapticTab } from "@/components/navigation/hapticTab";
import { fireEvent, render } from "@/test-utils/renderWithProviders";
import * as Haptics from "expo-haptics";
import type { BottomTabBarButtonProps } from "expo-router/js-tabs";

jest.mock("expo-router/react-navigation", () => {
  const { Pressable } = require("react-native");
  return { PlatformPressable: Pressable };
});

const renderTab = (onPressIn = jest.fn()) =>
  render(
    <HapticTab
      {...({ testID: "tab", onPressIn } as unknown as BottomTabBarButtonProps)}
    />,
  );

describe("HapticTab", () => {
  it("fires a haptic and forwards onPressIn on press", async () => {
    const onPressIn = jest.fn();
    const { getByTestId } = await renderTab(onPressIn);

    await fireEvent(getByTestId("tab"), "pressIn", { nativeEvent: {} });

    expect(Haptics.impactAsync).toHaveBeenCalled();
    expect(onPressIn).toHaveBeenCalled();
  });
});
