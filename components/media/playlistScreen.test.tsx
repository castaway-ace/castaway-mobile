import { queryKeys } from "@/api/queryKeys";
import PlaylistScreen from "@/components/media/playlistScreen";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { SheetType } from "@/contexts/sheetModalContext";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";
import {
  makeArtistRef,
  makePlaylist,
  makePlaylistTrack,
} from "@/test-utils/fixtures";
import { measureLikedCover } from "@/test-utils/measureLikedCover";
import {
  fireEvent,
  renderWithProviders,
} from "@/test-utils/renderWithProviders";
import { PlaylistTrack, PlaylistType } from "@/types/playlist";
import type { QueryClient } from "@tanstack/react-query";
import { StyleSheet } from "react-native";

const mockOpen = jest.fn();
const mockPlayQueue = jest.fn();

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

const tracks = [
  makePlaylistTrack({
    id: "pt1",
    trackId: "t1",
    title: "Song A",
    artists: [makeArtistRef({ name: "Artist A" })],
  }),
];

const seed = (
  queryClient: QueryClient,
  type: PlaylistType,
  playlistTracks: PlaylistTrack[],
) => {
  queryClient.setQueryData(
    queryKeys.playlists.detail("p1"),
    makePlaylist({ id: "p1", name: "Road Trip", type }),
  );
  queryClient.setQueryData(queryKeys.playlists.tracks("p1"), playlistTracks);
};

const renderScreen = async (
  type = PlaylistType.USER,
  playlistTracks: PlaylistTrack[] = tracks,
) => {
  const queryClient = createTestQueryClient();
  seed(queryClient, type, playlistTracks);
  return renderWithProviders(<PlaylistScreen id="p1" />, { queryClient });
};

describe("PlaylistScreen", () => {
  beforeEach(() => {
    mockedPlayerContext.mockReturnValue(idlePlayer);
  });

  it("renders the playlist name and its tracks", async () => {
    const { getByText, getAllByText } = await renderScreen();

    // Twice: once in the body title row, once in the sticky header.
    expect(getAllByText("Road Trip")).toHaveLength(2);
    expect(getByText("Song A")).toBeTruthy();
    expect(getByText("Artist A")).toBeTruthy();
  });

  it("keeps the sticky header title hidden at the top of the scroll", async () => {
    const { getByTestId } = await renderScreen();

    const style = StyleSheet.flatten(
      getByTestId("sticky-header-title").props.style,
    );
    expect(style.opacity).toBe(0);
  });

  it("shows an options button for USER playlists and opens the playlist sheet", async () => {
    const { getAllByText } = await renderScreen(PlaylistType.USER);

    const ellipses = getAllByText("ellipsis");
    expect(ellipses).toHaveLength(2);

    await fireEvent.press(ellipses[0]);
    expect(mockOpen).toHaveBeenCalledWith({
      type: SheetType.PLAYLIST,
      id: "p1",
    });
  });

  it("hides the options button for non-USER (LIKED) playlists", async () => {
    const { getAllByText } = await renderScreen(PlaylistType.LIKED);
    expect(getAllByText("ellipsis")).toHaveLength(1);
  });

  it("renders the heart mark instead of album art for LIKED playlists", async () => {
    const { getByText, queryByTestId, getByTestId } =
      await renderScreen(PlaylistType.LIKED);
    await measureLikedCover(getByTestId);

    expect(getByText("heart.fill")).toBeTruthy();
    expect(queryByTestId("expo-image")).toBeNull();
  });

  it("plays the playlist starting at the tapped track", async () => {
    const { getByText } = await renderScreen();

    await fireEvent.press(getByText("Song A"));

    expect(mockPlayQueue).toHaveBeenCalledWith(tracks, 0, {
      type: "playlist",
      id: "p1",
      name: "Road Trip",
    });
  });

  it("opens the track options sheet from the per-track control", async () => {
    const { getAllByText } = await renderScreen(PlaylistType.USER);

    await fireEvent.press(getAllByText("ellipsis")[1]);
    expect(mockOpen).toHaveBeenCalledWith({
      type: SheetType.PLAYLIST_TRACK,
      id: "p1",
      trackId: "t1",
    });
  });

  describe("now playing indicator", () => {
    const playlistSource = { type: "playlist", id: "p1", name: "Road Trip" };

    it("marks the playing track", async () => {
      mockedPlayerContext.mockReturnValue({
        ...idlePlayer,
        currentTrack: tracks[0],
        isPlaying: true,
        source: playlistSource,
      });

      const { getByLabelText, getByText } = await renderScreen();

      expect(getByLabelText("Now playing")).toBeTruthy();
      expect(StyleSheet.flatten(getByText("Song A").props.style).color).toBe(
        "#AE0558",
      );
    });

    it("reports the marked track as paused when playback is paused", async () => {
      mockedPlayerContext.mockReturnValue({
        ...idlePlayer,
        currentTrack: tracks[0],
        isPlaying: false,
        source: playlistSource,
      });

      const { getByLabelText, queryByLabelText } = await renderScreen();

      expect(getByLabelText("Paused")).toBeTruthy();
      expect(queryByLabelText("Now playing")).toBeNull();
    });

    it("marks only the entry that is playing when a track appears twice", async () => {
      const duplicated = [
        makePlaylistTrack({ id: "pt1", trackId: "t1", title: "Song A" }),
        makePlaylistTrack({ id: "pt2", trackId: "t1", title: "Song A" }),
      ];
      mockedPlayerContext.mockReturnValue({
        ...idlePlayer,
        currentTrack: duplicated[1],
        isPlaying: true,
        source: playlistSource,
      });

      const { getAllByLabelText, getAllByText } = await renderScreen(
        PlaylistType.USER,
        duplicated,
      );

      expect(getAllByLabelText("Now playing")).toHaveLength(1);
      const [first, second] = getAllByText("Song A");
      expect(StyleSheet.flatten(first.props.style).color).toBe("#1F1A1C");
      expect(StyleSheet.flatten(second.props.style).color).toBe("#AE0558");
    });

    it("marks nothing when the same track is playing from its album", async () => {
      mockedPlayerContext.mockReturnValue({
        ...idlePlayer,
        currentTrack: tracks[0],
        isPlaying: true,
        source: { type: "album", id: "a1", name: "OK Computer" },
      });

      const { queryByLabelText, getByText } = await renderScreen();

      expect(queryByLabelText("Now playing")).toBeNull();
      expect(StyleSheet.flatten(getByText("Song A").props.style).color).toBe(
        "#1F1A1C",
      );
    });

    it("marks nothing when a different playlist is playing", async () => {
      mockedPlayerContext.mockReturnValue({
        ...idlePlayer,
        currentTrack: tracks[0],
        isPlaying: true,
        source: { type: "playlist", id: "p2", name: "Focus" },
      });

      const { queryByLabelText } = await renderScreen();

      expect(queryByLabelText("Now playing")).toBeNull();
    });

    it("marks nothing when the player is idle", async () => {
      const { queryByLabelText } = await renderScreen();

      expect(queryByLabelText("Now playing")).toBeNull();
      expect(queryByLabelText("Paused")).toBeNull();
    });
  });
});
