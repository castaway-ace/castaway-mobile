import CustomTabBar from "@/components/navigation/customTabBar";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { makeTrack } from "@/test-utils/fixtures";
import { render } from "@/test-utils/renderWithProviders";
import type { ComponentProps } from "react";

jest.mock("@/contexts/audioPlayerContext", () => ({
  useAudioPlayerContext: jest.fn(),
}));
jest.mock("@/contexts/bottomInsetContext", () => ({
  useBottomInset: () => ({ bottomInset: 0, setBottomInset: jest.fn() }),
}));
jest.mock("expo-router/js-tabs", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    BottomTabBar: () => React.createElement(Text, { testID: "tabbar" }, "tabs"),
  };
});
jest.mock("@/components/player/musicPlayer", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: () =>
      React.createElement(Text, { testID: "mini-player" }, "player"),
  };
});

const mockedContext = useAudioPlayerContext as jest.Mock;
const props = {} as ComponentProps<typeof CustomTabBar>;

describe("CustomTabBar", () => {
  it("renders only the tab bar when nothing is playing", async () => {
    mockedContext.mockReturnValue({ currentTrack: null });
    const { getByTestId, queryByTestId } = await render(
      <CustomTabBar {...props} />,
    );
    expect(getByTestId("tabbar")).toBeTruthy();
    expect(queryByTestId("mini-player")).toBeNull();
  });

  it("renders the mini player above the tab bar when a track is playing", async () => {
    mockedContext.mockReturnValue({ currentTrack: makeTrack() });
    const { getByTestId } = await render(<CustomTabBar {...props} />);
    expect(getByTestId("mini-player")).toBeTruthy();
    expect(getByTestId("tabbar")).toBeTruthy();
  });
});
