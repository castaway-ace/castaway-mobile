import { useTrack } from "@/api/tracks/queries";
import AlbumTrackContent from "@/components/sheets/sheetModal/albumTrackContent";
import { SheetType } from "@/contexts/sheetModalContext";
import { makeArtistRef, makeTrack } from "@/test-utils/fixtures";
import {
  fireEvent,
  renderWithProviders,
} from "@/test-utils/renderWithProviders";
import { router } from "expo-router";

const mockOpen = jest.fn();
const mockClose = jest.fn();
const mockArtistInteraction = jest.fn();
const mockTrackStar = jest.fn();

jest.mock("@/contexts/sheetModalContext", () => ({
  ...jest.requireActual("@/contexts/sheetModalContext"),
  useSheetModal: () => ({ open: mockOpen, close: mockClose }),
}));
jest.mock("@/utils/useTabLocation", () => ({ useTabLocation: () => "search" }));
jest.mock("@/api/tracks/queries", () => ({ useTrack: jest.fn() }));
jest.mock("@/api/albums/queries", () => ({
  useAlbumCover: () => ({ data: "https://cover.jpg" }),
}));
jest.mock("@/api/interactions/mutations", () => ({
  useUpdateArtistInteraction: () => ({ mutate: mockArtistInteraction }),
}));
jest.mock("@/api/tracks/mutations", () => ({
  useTrackStar: () => ({ mutate: mockTrackStar }),
}));

const track = makeTrack({
  id: "tk1",
  title: "Song",
  starred: false,
  artists: [makeArtistRef({ id: "ar1", name: "Artist" })],
});

const content = { type: SheetType.ALBUM_TRACK as const, id: "al1", trackId: "tk1" };

beforeEach(() => {
  (useTrack as jest.Mock).mockReturnValue({ data: track });
});

describe("AlbumTrackContent", () => {
  it("renders the track info and the three actions", async () => {
    const { getByText } = await renderWithProviders(
      <AlbumTrackContent content={content} />,
    );
    expect(getByText("Song")).toBeTruthy();
    expect(getByText("Add to Playlist")).toBeTruthy();
    expect(getByText("Add to Liked Songs")).toBeTruthy();
    expect(getByText("Go to Artist")).toBeTruthy();
  });

  it("opens the playlist-select sheet", async () => {
    const { getByText } = await renderWithProviders(
      <AlbumTrackContent content={content} />,
    );
    await fireEvent.press(getByText("Add to Playlist"));
    expect(mockOpen).toHaveBeenCalledWith({
      type: SheetType.PLAYLIST_SELECT,
      trackId: "tk1",
    });
  });

  it("stars the track and closes", async () => {
    const { getByText } = await renderWithProviders(
      <AlbumTrackContent content={content} />,
    );
    await fireEvent.press(getByText("Add to Liked Songs"));
    expect(mockTrackStar).toHaveBeenCalledWith({ id: "tk1", starred: false });
    expect(mockClose).toHaveBeenCalled();
  });

  it("records the artist interaction, navigates, and closes", async () => {
    const { getByText } = await renderWithProviders(
      <AlbumTrackContent content={content} />,
    );
    await fireEvent.press(getByText("Go to Artist"));
    expect(mockArtistInteraction).toHaveBeenCalledWith("ar1");
    expect(router.navigate).toHaveBeenCalledWith(
      "/(tabs)/search/artists/ar1",
    );
    expect(mockClose).toHaveBeenCalled();
  });

  it("shows the remove label when the track is already starred", async () => {
    (useTrack as jest.Mock).mockReturnValue({
      data: { ...track, starred: true },
    });
    const { getByText } = await renderWithProviders(
      <AlbumTrackContent content={content} />,
    );
    expect(getByText("Remove from Liked Songs")).toBeTruthy();
  });
});
