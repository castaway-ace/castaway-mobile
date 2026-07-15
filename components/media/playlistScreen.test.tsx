import { queryKeys } from "@/api/queryKeys";
import PlaylistScreen from "@/components/media/playlistScreen";
import { SheetType } from "@/contexts/sheetModalContext";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";
import {
  makeArtistRef,
  makePlaylist,
  makePlaylistTrack,
} from "@/test-utils/fixtures";
import {
  fireEvent,
  renderWithProviders,
} from "@/test-utils/renderWithProviders";
import { PlaylistType } from "@/types/playlist";
import type { QueryClient } from "@tanstack/react-query";
import { StyleSheet } from "react-native";

const mockOpen = jest.fn();
const mockPlayQueue = jest.fn();

jest.mock("@/contexts/audioPlayerContext", () => ({
  useAudioPlayerContext: () => ({ playQueue: mockPlayQueue }),
}));

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

const seed = (queryClient: QueryClient, type: PlaylistType) => {
  queryClient.setQueryData(
    queryKeys.playlists.detail("p1"),
    makePlaylist({ id: "p1", name: "Road Trip", type }),
  );
  queryClient.setQueryData(queryKeys.playlists.tracks("p1"), tracks);
};

const renderScreen = async (type = PlaylistType.USER) => {
  const queryClient = createTestQueryClient();
  seed(queryClient, type);
  return renderWithProviders(<PlaylistScreen id="p1" />, { queryClient });
};

describe("PlaylistScreen", () => {
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
});
