import { useAlbum } from "@/api/albums/queries";
import AlbumPage from "@/components/pages/albumPage";
import { makeAlbum } from "@/test-utils/fixtures";
import { fireEvent, render } from "@/test-utils/renderWithProviders";
import { router, useLocalSearchParams, useSegments } from "expo-router";

const mockArtistInteraction = jest.fn();

jest.mock("@/api/albums/queries", () => ({ useAlbum: jest.fn() }));

jest.mock("@/api/interactions/mutations", () => ({
  useUpdateArtistInteraction: () => ({ mutate: mockArtistInteraction }),
}));

jest.mock("@/components/media/albumScreen", () => {
  const React = require("react");
  const { Text, Pressable } = require("react-native");
  return {
    __esModule: true,
    default: ({
      album,
      onArtistPress,
    }: {
      album: { title: string };
      onArtistPress: (id: string) => void;
    }) =>
      React.createElement(React.Fragment, null, [
        React.createElement(
          Text,
          { key: "t", testID: "album-title" },
          album.title,
        ),
        React.createElement(
          Pressable,
          {
            key: "b",
            testID: "artist-btn",
            onPress: () => onArtistPress("ar9"),
          },
          React.createElement(Text, null, "artist"),
        ),
      ]),
  };
});

describe("AlbumPage", () => {
  beforeEach(() => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "a1" });
    (useSegments as jest.Mock).mockReturnValue(["(tabs)", "search"]);
  });

  it("renders the screen for the resolved album", async () => {
    (useAlbum as jest.Mock).mockReturnValue({
      data: makeAlbum({ title: "Kid A" }),
    });

    const { getByTestId } = await render(<AlbumPage />);
    expect(getByTestId("album-title").props.children).toBe("Kid A");
  });

  it("records the artist interaction and navigates within the active tab", async () => {
    (useAlbum as jest.Mock).mockReturnValue({
      data: makeAlbum({ title: "Kid A" }),
    });

    const { getByTestId } = await render(<AlbumPage />);
    await fireEvent.press(getByTestId("artist-btn"));

    expect(mockArtistInteraction).toHaveBeenCalledWith("ar9");
    expect(router.navigate).toHaveBeenCalledWith("/(tabs)/search/artists/ar9");
  });

  it("renders nothing until the album has loaded", async () => {
    (useAlbum as jest.Mock).mockReturnValue({ data: undefined });

    const { toJSON } = await render(<AlbumPage />);
    expect(toJSON()).toBeNull();
  });
});
