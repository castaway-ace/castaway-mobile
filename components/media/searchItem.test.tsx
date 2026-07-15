import { albumApi } from "@/api/albums/api";
import SearchItem from "@/components/media/searchItem";
import { makeAlbum, makeAlbumTrack } from "@/test-utils/fixtures";
import {
  act,
  fireEvent,
  renderWithProviders,
  waitFor,
} from "@/test-utils/renderWithProviders";
import {
  SearchItemType,
  type AlbumSearchItem,
  type ArtistSearchItem,
  type TrackSearchItem,
} from "@/utils/search";
import { router } from "expo-router";

const mockPlayQueue = jest.fn();
const mockAlbumInteraction = jest.fn();
const mockArtistInteraction = jest.fn();

jest.mock("expo-router", () => ({ router: { navigate: jest.fn() } }));
const navigateMock = router.navigate as jest.Mock;

jest.mock("@/contexts/audioPlayerContext", () => ({
  useAudioPlayerContext: () => ({ playQueue: mockPlayQueue }),
}));

jest.mock("@/api/interactions/mutations", () => ({
  useUpdateAlbumInteraction: () => ({ mutate: mockAlbumInteraction }),
  useUpdateArtistInteraction: () => ({ mutate: mockArtistInteraction }),
}));

jest.mock("@/components/ui/iconSymbol", () => ({ IconSymbol: () => null }));

jest.mock("@/api/albums/api", () => ({
  ...jest.requireActual("@/api/albums/api"),
  albumApi: { getOne: jest.fn() },
}));

const albumItem: AlbumSearchItem = {
  id: "al1",
  type: SearchItemType.ALBUM,
  text: "Kid A",
  subText: "Album • Radiohead",
  imageUrl: "https://cover/kida.jpg",
};

const artistItem: ArtistSearchItem = {
  id: "ar1",
  type: SearchItemType.ARTIST,
  text: "Radiohead",
  subText: "Artist",
  imageUrl: undefined,
};

describe("SearchItem", () => {
  it("renders an album row with text, subtext, and cover", async () => {
    const { getByText, getByTestId } = await renderWithProviders(
      <SearchItem item={albumItem} />,
    );

    expect(getByText("Kid A")).toBeTruthy();
    expect(getByText("Album • Radiohead")).toBeTruthy();
    expect(getByTestId("expo-image").props.accessibilityLabel).toBe(
      "https://cover/kida.jpg",
    );
  });

  it("records an interaction and navigates on album press", async () => {
    const { getByText } = await renderWithProviders(
      <SearchItem item={albumItem} />,
    );

    await fireEvent.press(getByText("Kid A"));

    await waitFor(() =>
      expect(mockAlbumInteraction).toHaveBeenCalledWith("al1"),
    );
    expect(navigateMock).toHaveBeenCalledWith("/(tabs)/search/albums/al1");
  });

  it("records an interaction and navigates on artist press", async () => {
    const { getByText } = await renderWithProviders(
      <SearchItem item={artistItem} />,
    );

    await fireEvent.press(getByText("Radiohead"));

    await waitFor(() =>
      expect(mockArtistInteraction).toHaveBeenCalledWith("ar1"),
    );
    expect(navigateMock).toHaveBeenCalledWith("/(tabs)/search/artists/ar1");
  });

  it("keys the cover on the bucket path so re-signing is not a cache miss", async () => {
    const signed = (sig: string): AlbumSearchItem => ({
      ...albumItem,
      imageUrl: `https://cover/kida.jpg?X-Amz-Signature=${sig}`,
    });

    const { getByTestId, rerender } = await renderWithProviders(
      <SearchItem item={signed("aaa")} />,
    );

    expect(getByTestId("expo-image").props.source).toEqual({
      uri: "https://cover/kida.jpg?X-Amz-Signature=aaa",
      cacheKey: "https://cover/kida.jpg",
    });

    rerender(<SearchItem item={signed("bbb")} />);

    expect(getByTestId("expo-image").props.source.cacheKey).toBe(
      "https://cover/kida.jpg",
    );
  });

  it("uses the artist placeholder when there is no image", async () => {
    const { getByTestId } = await renderWithProviders(
      <SearchItem item={artistItem} />,
    );

    expect(getByTestId("expo-image").props.accessibilityLabel).toBeUndefined();
  });

  it("starts the album queue at the tapped track on track press", async () => {
    const album = makeAlbum({
      id: "al1",
      title: "Kid A",
      tracks: [makeAlbumTrack({ id: "t0" }), makeAlbumTrack({ id: "t1" })],
    });
    (albumApi.getOne as jest.Mock).mockResolvedValue(album);

    const trackItem: TrackSearchItem = {
      id: "t1",
      type: SearchItemType.TRACK,
      text: "Idioteque",
      subText: "Track • Radiohead",
      imageUrl: "https://cover/kida.jpg",
      albumId: "al1",
    };

    const { getByText } = await renderWithProviders(
      <SearchItem item={trackItem} />,
    );

    await act(async () => {
      await fireEvent.press(getByText("Idioteque"));
    });

    await waitFor(() =>
      expect(mockPlayQueue).toHaveBeenCalledWith(album.tracks, 1, {
        type: "album",
        name: "Kid A",
      }),
    );
    expect(mockAlbumInteraction).toHaveBeenCalledWith("al1");
  });
});
