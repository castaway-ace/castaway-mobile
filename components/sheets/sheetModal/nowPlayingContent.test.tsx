import NowPlayingContent from "@/components/sheets/sheetModal/nowPlayingContent";
import { SheetType } from "@/contexts/sheetModalContext";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { makeArtistRef, makeTrack } from "@/test-utils/fixtures";
import {
  fireEvent,
  renderWithProviders,
} from "@/test-utils/renderWithProviders";
import { router } from "expo-router";

const mockOpen = jest.fn();
const mockClose = jest.fn();
const mockClosePlayer = jest.fn();
const mockAlbumInteraction = jest.fn();
const mockArtistInteraction = jest.fn();

jest.mock("@/contexts/sheetModalContext", () => ({
  ...jest.requireActual("@/contexts/sheetModalContext"),
  useSheetModal: () => ({ open: mockOpen, close: mockClose }),
}));
jest.mock("@/contexts/playerModalContext", () => ({
  usePlayerModal: () => ({ close: mockClosePlayer }),
}));
jest.mock("@/contexts/audioPlayerContext", () => ({
  useAudioPlayerContext: jest.fn(),
}));
jest.mock("@/utils/useTabLocation", () => ({ useTabLocation: () => "home" }));
jest.mock("@/api/interactions/mutations", () => ({
  useUpdateAlbumInteraction: () => ({ mutate: mockAlbumInteraction }),
  useUpdateArtistInteraction: () => ({ mutate: mockArtistInteraction }),
}));

const track = makeTrack({
  id: "tk1",
  artists: [makeArtistRef({ id: "ar1" })],
});

const mockedContext = useAudioPlayerContext as jest.Mock;

describe("NowPlayingContent", () => {
  it("renders no actions when there is no current track", async () => {
    mockedContext.mockReturnValue({ currentTrack: null });
    const { queryByText } = await renderWithProviders(<NowPlayingContent />);
    expect(queryByText("Add to Playlist")).toBeNull();
    expect(queryByText("Go to Album")).toBeNull();
  });

  it("opens the playlist-select sheet for the current track", async () => {
    mockedContext.mockReturnValue({ currentTrack: track });
    const { getByText } = await renderWithProviders(<NowPlayingContent />);

    await fireEvent.press(getByText("Add to Playlist"));
    expect(mockOpen).toHaveBeenCalledWith({
      type: SheetType.PLAYLIST_SELECT,
      trackId: "tk1",
    });
  });

  it("navigates to the album, closing the sheet and player", async () => {
    mockedContext.mockReturnValue({ currentTrack: track });
    const { getByText } = await renderWithProviders(<NowPlayingContent />);

    await fireEvent.press(getByText("Go to Album"));
    expect(mockAlbumInteraction).toHaveBeenCalledWith(track.album.id);
    expect(router.navigate).toHaveBeenCalledWith(
      `/(tabs)/home/albums/${track.album.id}`,
    );
    expect(mockClose).toHaveBeenCalled();
    expect(mockClosePlayer).toHaveBeenCalled();
  });

  it("navigates to the artist", async () => {
    mockedContext.mockReturnValue({ currentTrack: track });
    const { getByText } = await renderWithProviders(<NowPlayingContent />);

    await fireEvent.press(getByText("Go to Artist"));
    expect(mockArtistInteraction).toHaveBeenCalledWith("ar1");
    expect(router.navigate).toHaveBeenCalledWith("/(tabs)/home/artists/ar1");
  });
});
