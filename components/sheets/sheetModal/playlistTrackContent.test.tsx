import { usePlaylist } from "@/api/playlists/queries";
import { useTrack } from "@/api/tracks/queries";
import PlaylistTrackContent from "@/components/sheets/sheetModal/playlistTrackContent";
import { SheetType } from "@/contexts/sheetModalContext";
import { makeArtistRef, makePlaylist, makeTrack } from "@/test-utils/fixtures";
import { PlaylistType } from "@/types/playlist";
import {
  act,
  fireEvent,
  renderWithProviders,
} from "@/test-utils/renderWithProviders";
import { router } from "expo-router";

const mockOpen = jest.fn();
const mockClose = jest.fn();
const mockOpenConfirm = jest.fn();
const mockAlbumInteraction = jest.fn();
const mockArtistInteraction = jest.fn();
const mockTrackStar = jest.fn();
const mockRemoveTrack = jest.fn();

jest.mock("@/contexts/sheetModalContext", () => ({
  ...jest.requireActual("@/contexts/sheetModalContext"),
  useSheetModal: () => ({ open: mockOpen, close: mockClose }),
}));
jest.mock("@/contexts/popupModalContext", () => ({
  usePopupModal: () => ({ openConfirm: mockOpenConfirm }),
}));
jest.mock("@/utils/useTabLocation", () => ({ useTabLocation: () => "library" }));
jest.mock("@/api/tracks/queries", () => ({ useTrack: jest.fn() }));
jest.mock("@/api/playlists/queries", () => ({ usePlaylist: jest.fn() }));
jest.mock("@/api/albums/queries", () => ({
  useAlbumCover: () => ({ data: "https://cover.jpg" }),
}));
jest.mock("@/api/interactions/mutations", () => ({
  useUpdateAlbumInteraction: () => ({ mutate: mockAlbumInteraction }),
  useUpdateArtistInteraction: () => ({ mutate: mockArtistInteraction }),
}));
jest.mock("@/api/tracks/mutations", () => ({
  useTrackStar: () => ({ mutate: mockTrackStar }),
}));
jest.mock("@/api/playlists/mutations", () => ({
  useRemoveTrackFromPlaylist: () => ({ mutate: mockRemoveTrack }),
}));

const track = makeTrack({
  id: "tk1",
  title: "Song",
  starred: false,
  album: { id: "al1", title: "Album" },
  artists: [makeArtistRef({ id: "ar1", name: "Artist" })],
});

const content = {
  type: SheetType.PLAYLIST_TRACK as const,
  id: "p1",
  trackId: "tk1",
};

beforeEach(() => {
  (useTrack as jest.Mock).mockReturnValue({ data: track });
  (usePlaylist as jest.Mock).mockReturnValue({
    data: makePlaylist({ id: "p1", type: PlaylistType.USER }),
  });
});

describe("PlaylistTrackContent", () => {
  it("shows the remove action for USER playlists and navigation options", async () => {
    const { getByText } = await renderWithProviders(
      <PlaylistTrackContent content={content} />,
    );
    expect(getByText("Song")).toBeTruthy();
    expect(getByText("Remove from this playlist")).toBeTruthy();
    expect(getByText("Go to Album")).toBeTruthy();
    expect(getByText("Go to Artist")).toBeTruthy();
  });

  it("hides the remove action for non-USER playlists", async () => {
    (usePlaylist as jest.Mock).mockReturnValue({
      data: makePlaylist({ id: "p1", type: PlaylistType.LIKED }),
    });
    const { queryByText } = await renderWithProviders(
      <PlaylistTrackContent content={content} />,
    );
    expect(queryByText("Remove from this playlist")).toBeNull();
  });

  it("confirms then removes the track from the playlist", async () => {
    const { getByText } = await renderWithProviders(
      <PlaylistTrackContent content={content} />,
    );
    await fireEvent.press(getByText("Remove from this playlist"));

    expect(mockOpenConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Remove Track", onConfirm: expect.any(Function) }),
    );
    await act(async () => mockOpenConfirm.mock.calls[0][0].onConfirm());
    expect(mockRemoveTrack).toHaveBeenCalledWith({
      playlistId: "p1",
      trackId: "tk1",
    });
    expect(mockClose).toHaveBeenCalled();
  });

  it("navigates to the album", async () => {
    const { getByText } = await renderWithProviders(
      <PlaylistTrackContent content={content} />,
    );
    await fireEvent.press(getByText("Go to Album"));
    expect(mockAlbumInteraction).toHaveBeenCalledWith("al1");
    expect(router.navigate).toHaveBeenCalledWith("/(tabs)/library/albums/al1");
    expect(mockClose).toHaveBeenCalled();
  });

  it("navigates to the artist", async () => {
    const { getByText } = await renderWithProviders(
      <PlaylistTrackContent content={content} />,
    );
    await fireEvent.press(getByText("Go to Artist"));
    expect(mockArtistInteraction).toHaveBeenCalledWith("ar1");
    expect(router.navigate).toHaveBeenCalledWith(
      "/(tabs)/library/artists/ar1",
    );
  });
});
