import PlaylistPage from "@/components/pages/playlistPage";
import { render } from "@/test-utils/renderWithProviders";
import { useLocalSearchParams } from "expo-router";

jest.mock("@/components/media/playlistScreen", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ id }: { id: string }) =>
      React.createElement(Text, { testID: "screen-id" }, id),
  };
});

describe("PlaylistPage", () => {
  it("passes the route id through to the playlist screen", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "p1" });

    const { getByTestId } = await render(<PlaylistPage />);

    expect(getByTestId("screen-id").props.children).toBe("p1");
  });
});
