import ArtistPage from "@/components/pages/artistPage";
import { fireEvent, render } from "@/test-utils/renderWithProviders";
import { router, useLocalSearchParams, useSegments } from "expo-router";

jest.mock("@/components/media/artistScreen", () => {
  const React = require("react");
  const { Text, Pressable } = require("react-native");
  return {
    __esModule: true,
    default: ({
      id,
      onAlbumPress,
    }: {
      id: string;
      onAlbumPress: (id: string) => void;
    }) =>
      React.createElement(React.Fragment, null, [
        React.createElement(Text, { key: "t", testID: "artist-id" }, id),
        React.createElement(
          Pressable,
          { key: "b", testID: "album-btn", onPress: () => onAlbumPress("al9") },
          React.createElement(Text, null, "album"),
        ),
      ]),
  };
});

describe("ArtistPage", () => {
  beforeEach(() => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "ar1" });
    (useSegments as jest.Mock).mockReturnValue(["(tabs)", "library"]);
  });

  it("passes the route id through to the artist screen", async () => {
    const { getByTestId } = await render(<ArtistPage />);
    expect(getByTestId("artist-id").props.children).toBe("ar1");
  });

  it("navigates to the album within the active tab", async () => {
    const { getByTestId } = await render(<ArtistPage />);
    await fireEvent.press(getByTestId("album-btn"));

    expect(router.navigate).toHaveBeenCalledWith("/(tabs)/library/albums/al9");
  });
});
