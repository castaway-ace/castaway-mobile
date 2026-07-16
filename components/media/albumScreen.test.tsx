import { queryKeys } from "@/api/queryKeys";
import AlbumScreen from "@/components/media/albumScreen";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { SheetType } from "@/contexts/sheetModalContext";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";
import {
  makeAlbum,
  makeAlbumTrack,
  makeArtistRef,
} from "@/test-utils/fixtures";
import {
  fireEvent,
  renderWithProviders,
} from "@/test-utils/renderWithProviders";
import type { Album } from "@/types/albums";
import type { QueryClient } from "@tanstack/react-query";
import { StyleSheet } from "react-native";

const mockAlbumStar = jest.fn();
const mockPlayQueue = jest.fn();
const mockOpen = jest.fn();

jest.mock("@/api/albums/mutations", () => ({
  useAlbumStar: () => ({ mutate: mockAlbumStar }),
}));

jest.mock("@/contexts/audioPlayerContext", () => ({
  useAudioPlayerContext: jest.fn(),
}));

const mockedPlayerContext = useAudioPlayerContext as jest.Mock;

const idlePlayer = {
  playQueue: mockPlayQueue,
  currentTrack: null,
  isPlaying: false,
  source: null,
};

jest.mock("@/contexts/sheetModalContext", () => ({
  ...jest.requireActual("@/contexts/sheetModalContext"),
  useSheetModal: () => ({ open: mockOpen }),
}));

const makeTestAlbum = (overrides: Partial<Album> = {}): Album =>
  makeAlbum({
    id: "a1",
    title: "OK Computer",
    releaseDate: "1997-06-16T12:00:00.000Z",
    starred: false,
    artists: [makeArtistRef({ id: "ar1", name: "Radiohead" })],
    tracks: [
      makeAlbumTrack({
        id: "tk1",
        title: "Airbag",
        trackNumber: 1,
        artists: [makeArtistRef({ name: "Thom" })],
      }),
      makeAlbumTrack({ id: "tk2", title: "Karma Police", trackNumber: 2 }),
    ],
    ...overrides,
  });

const renderScreen = async (
  album: Album,
  onArtistPress = jest.fn(),
): Promise<
  {
    onArtistPress: jest.Mock;
  } & Awaited<ReturnType<typeof renderWithProviders>>
> => {
  const queryClient: QueryClient = createTestQueryClient();
  queryClient.setQueryData(
    queryKeys.albums.cover(album.id),
    "https://cover.jpg",
  );
  const utils = await renderWithProviders(
    <AlbumScreen album={album} onArtistPress={onArtistPress} />,
    { queryClient },
  );
  return { onArtistPress, ...utils };
};

describe("AlbumScreen", () => {
  beforeEach(() => {
    mockedPlayerContext.mockReturnValue(idlePlayer);
  });

  it("renders the album title, artist, release line, and tracks", async () => {
    const { getByText, getAllByText } = await renderScreen(makeTestAlbum());

    // Twice: once in the body header, once in the sticky header.
    expect(getAllByText("OK Computer")).toHaveLength(2);
    expect(getByText("Radiohead")).toBeTruthy();
    expect(getByText(/^Album • /)).toBeTruthy();
    expect(getByText("Airbag")).toBeTruthy();
    expect(getByText("Karma Police")).toBeTruthy();
  });

  it("keeps the sticky header title hidden at the top of the scroll", async () => {
    const { getByTestId } = await renderScreen(makeTestAlbum());

    const style = StyleSheet.flatten(
      getByTestId("sticky-header-title").props.style,
    );
    expect(style.opacity).toBe(0);
  });

  it("calls onArtistPress when an artist is tapped", async () => {
    const { getByText, onArtistPress } = await renderScreen(makeTestAlbum());

    await fireEvent.press(getByText("Radiohead"));
    expect(onArtistPress).toHaveBeenCalledWith("ar1");
  });

  it("renders a Various Artists credit as plain, non-navigable text", async () => {
    const album = makeTestAlbum({
      artists: [
        makeArtistRef({
          id: "va",
          name: "Various Artists",
          isVarious: true,
        }),
      ],
    });
    const { getByText, onArtistPress } = await renderScreen(album);

    await fireEvent.press(getByText("Various Artists"));
    expect(onArtistPress).not.toHaveBeenCalled();
  });

  it("plays the album starting at the tapped track", async () => {
    const album = makeTestAlbum();
    const { getByText } = await renderScreen(album);

    await fireEvent.press(getByText("Karma Police"));
    expect(mockPlayQueue).toHaveBeenCalledWith(album.tracks, 1, {
      type: "album",
      id: "a1",
      name: "OK Computer",
    });
  });

  describe("multi-disc albums", () => {
    const makeMultiDiscAlbum = () =>
      makeTestAlbum({
        tracks: [
          makeAlbumTrack({ id: "tk1", title: "Disc-1 A", discNumber: 1 }),
          makeAlbumTrack({ id: "tk2", title: "Disc-1 B", discNumber: 1 }),
          makeAlbumTrack({ id: "tk3", title: "Disc-2 A", discNumber: 2 }),
          makeAlbumTrack({ id: "tk4", title: "Disc-2 B", discNumber: 2 }),
        ],
      });

    it("renders a header per disc when the album spans multiple discs", async () => {
      const { getByText } = await renderScreen(makeMultiDiscAlbum());

      expect(getByText("Disc 1")).toBeTruthy();
      expect(getByText("Disc 2")).toBeTruthy();
    });

    it("shows no disc header for a single-disc album", async () => {
      const { queryByText } = await renderScreen(makeTestAlbum());

      expect(queryByText(/Disc \d/i)).toBeNull();
    });

    it("plays from the flat album index when a later disc's track is tapped", async () => {
      const album = makeMultiDiscAlbum();
      const { getByText } = await renderScreen(album);

      await fireEvent.press(getByText("Disc-2 A"));
      expect(mockPlayQueue).toHaveBeenCalledWith(album.tracks, 2, {
        type: "album",
        id: "a1",
        name: "OK Computer",
      });
    });
  });

  it("shows an outline heart and stars the album when unstarred", async () => {
    const { getByText } = await renderScreen(makeTestAlbum({ starred: false }));

    expect(getByText("heart")).toBeTruthy();
    await fireEvent.press(getByText("heart"));
    expect(mockAlbumStar).toHaveBeenCalledWith({ id: "a1", starred: false });
  });

  it("shows a filled heart when the album is already starred", async () => {
    const { getByText } = await renderScreen(makeTestAlbum({ starred: true }));
    expect(getByText("heart.fill")).toBeTruthy();
  });

  it("opens the album-track options sheet", async () => {
    const { getAllByText } = await renderScreen(makeTestAlbum());

    await fireEvent.press(getAllByText("ellipsis")[0]);
    expect(mockOpen).toHaveBeenCalledWith({
      type: SheetType.ALBUM_TRACK,
      id: "a1",
      trackId: "tk1",
    });
  });

  describe("now playing indicator", () => {
    const albumSource = { type: "album", id: "a1", name: "OK Computer" };

    it("marks the playing track and leaves the rest of the list alone", async () => {
      const album = makeTestAlbum();
      mockedPlayerContext.mockReturnValue({
        ...idlePlayer,
        currentTrack: album.tracks[1],
        isPlaying: true,
        source: albumSource,
      });

      const { getByLabelText, getByText } = await renderScreen(album);

      expect(getByLabelText("Now playing")).toBeTruthy();
      // Exactly one row is marked, and it's the one that's playing.
      expect(
        StyleSheet.flatten(getByText("Karma Police").props.style).color,
      ).toBe("#AE0558");
      expect(StyleSheet.flatten(getByText("Airbag").props.style).color).toBe(
        "#1F1A1C",
      );
    });

    it("reports the marked track as paused when playback is paused", async () => {
      const album = makeTestAlbum();
      mockedPlayerContext.mockReturnValue({
        ...idlePlayer,
        currentTrack: album.tracks[0],
        isPlaying: false,
        source: albumSource,
      });

      const { getByLabelText, queryByLabelText } = await renderScreen(album);

      expect(getByLabelText("Paused")).toBeTruthy();
      expect(queryByLabelText("Now playing")).toBeNull();
    });

    it("follows the queue as it advances to the next track", async () => {
      const album = makeTestAlbum();
      mockedPlayerContext.mockReturnValue({
        ...idlePlayer,
        currentTrack: album.tracks[0],
        isPlaying: true,
        source: albumSource,
      });

      const { getByText, rerender } = await renderScreen(album);
      expect(StyleSheet.flatten(getByText("Airbag").props.style).color).toBe(
        "#AE0558",
      );

      mockedPlayerContext.mockReturnValue({
        ...idlePlayer,
        currentTrack: album.tracks[1],
        isPlaying: true,
        source: albumSource,
      });
      await rerender(<AlbumScreen album={album} onArtistPress={jest.fn()} />);

      expect(StyleSheet.flatten(getByText("Airbag").props.style).color).toBe(
        "#1F1A1C",
      );
      expect(
        StyleSheet.flatten(getByText("Karma Police").props.style).color,
      ).toBe("#AE0558");
    });

    it("marks nothing when the same track is playing from a playlist", async () => {
      const album = makeTestAlbum();
      mockedPlayerContext.mockReturnValue({
        ...idlePlayer,
        currentTrack: album.tracks[0],
        isPlaying: true,
        source: { type: "playlist", id: "pl1", name: "Roadtrip" },
      });

      const { queryByLabelText, getByText } = await renderScreen(album);

      expect(queryByLabelText("Now playing")).toBeNull();
      expect(StyleSheet.flatten(getByText("Airbag").props.style).color).toBe(
        "#1F1A1C",
      );
    });

    it("marks nothing when a different album is playing", async () => {
      const album = makeTestAlbum();
      mockedPlayerContext.mockReturnValue({
        ...idlePlayer,
        currentTrack: album.tracks[0],
        isPlaying: true,
        source: { type: "album", id: "a2", name: "In Rainbows" },
      });

      const { queryByLabelText } = await renderScreen(album);

      expect(queryByLabelText("Now playing")).toBeNull();
    });

    it("marks nothing when the player is idle", async () => {
      const { queryByLabelText } = await renderScreen(makeTestAlbum());

      expect(queryByLabelText("Now playing")).toBeNull();
      expect(queryByLabelText("Paused")).toBeNull();
    });
  });
});
