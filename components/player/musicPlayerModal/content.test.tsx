import MusicPlayerModalContent from "@/components/player/musicPlayerModal/content";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { SheetType } from "@/contexts/sheetModalContext";
import { makeArtistRef, makeTrack } from "@/test-utils/fixtures";
import { fireEvent, render } from "@/test-utils/renderWithProviders";
import { router } from "expo-router";

const mockClose = jest.fn();
const mockOpenOptions = jest.fn();
const mockNext = jest.fn();
const mockPrevious = jest.fn();
const mockSkipNext = jest.fn();
const mockSkipPrevious = jest.fn();
const mockToggleShuffle = jest.fn();
const mockCycleRepeat = jest.fn();
const mockToggleStar = jest.fn();
const mockPlayPause = jest.fn();
const mockAlbumInteraction = jest.fn();
const mockArtistInteraction = jest.fn();
const mockPlaylistInteraction = jest.fn();

jest.mock("@/components/player/crossfadeIcon", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    CrossfadeIcon: ({ name }: { name?: string }) =>
      React.createElement(Text, null, name),
  };
});
jest.mock("@/components/player/musicPlayerModal/progressBar", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/contexts/audioPlayerContext", () => ({
  useAudioPlayerContext: jest.fn(),
}));
jest.mock("@/contexts/playerModalContext", () => ({
  usePlayerModal: () => ({ close: mockClose }),
}));
jest.mock("@/contexts/sheetModalContext", () => ({
  ...jest.requireActual("@/contexts/sheetModalContext"),
  useSheetModal: () => ({ open: mockOpenOptions }),
}));
jest.mock("@/components/player/useNowPlayingControls", () => ({
  useActiveTrackStar: () => ({ starred: false, toggleStar: mockToggleStar }),
  usePlayPause: () => mockPlayPause,
}));
jest.mock("@/utils/useTabLocation", () => ({ useTabLocation: () => "home" }));
// Mandatory, not tidiness: these tests use plain RTL `render`, so there's no
// QueryClientProvider and the cover carousel's real query would throw.
jest.mock("@/api/albums/queries", () => ({
  useAlbumCover: () => ({ data: "https://cover.jpg" }),
}));
jest.mock("@/api/interactions/mutations", () => ({
  useUpdateAlbumInteraction: () => ({ mutate: mockAlbumInteraction }),
  useUpdateArtistInteraction: () => ({ mutate: mockArtistInteraction }),
  useUpdatePlaylistInteraction: () => ({ mutate: mockPlaylistInteraction }),
}));

const mockedContext = useAudioPlayerContext as jest.Mock;

const track = makeTrack({
  id: "tk1",
  title: "Reckoner",
  artists: [makeArtistRef({ id: "ar1", name: "Radiohead" })],
});

// Neighbors stay null so both carousels render only the current track, keeping the
// `getByText` lookups below unambiguous; the strips are covered in their own tests.
const baseState = {
  isPlaying: false,
  next: mockNext,
  previous: mockPrevious,
  skipNext: mockSkipNext,
  skipPrevious: mockSkipPrevious,
  currentTrack: track,
  previousTrack: null,
  nextTrack: null,
  coverArtUrl: "https://cover.jpg",
  coverColor: "#123456",
  source: { type: "album", id: "al1", name: "In Rainbows" },
  toggleShuffle: mockToggleShuffle,
  isShuffled: false,
  cycleRepeat: mockCycleRepeat,
  repeatMode: "off",
};

describe("MusicPlayerModalContent", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders nothing without a current track", async () => {
    mockedContext.mockReturnValue({ ...baseState, currentTrack: null });
    const { toJSON } = await render(<MusicPlayerModalContent />);
    expect(toJSON()).toBeNull();
  });

  it("renders the track, source label, and transport controls", async () => {
    mockedContext.mockReturnValue(baseState);
    const { getByText } = await render(<MusicPlayerModalContent />);

    expect(getByText("Reckoner")).toBeTruthy();
    expect(getByText("Radiohead")).toBeTruthy();
    expect(getByText("Playing from Album")).toBeTruthy();
    expect(getByText("In Rainbows")).toBeTruthy();
    expect(getByText("shuffle")).toBeTruthy();
  });

  it("wires up every transport control", async () => {
    mockedContext.mockReturnValue(baseState);
    const { getByText } = await render(<MusicPlayerModalContent />);

    await fireEvent.press(getByText("chevron.down"));
    expect(mockClose).toHaveBeenCalled();

    await fireEvent.press(getByText("ellipsis"));
    expect(mockOpenOptions).toHaveBeenCalledWith({
      type: SheetType.NOW_PLAYING,
    });

    await fireEvent.press(getByText("shuffle"));
    expect(mockToggleShuffle).toHaveBeenCalled();

    await fireEvent.press(getByText("backward.end"));
    expect(mockPrevious).toHaveBeenCalled();

    await fireEvent.press(getByText("play.circle.fill"));
    expect(mockPlayPause).toHaveBeenCalled();

    await fireEvent.press(getByText("forward.end"));
    expect(mockNext).toHaveBeenCalled();

    await fireEvent.press(getByText("repeat"));
    expect(mockCycleRepeat).toHaveBeenCalled();

    await fireEvent.press(getByText("heart"));
    expect(mockToggleStar).toHaveBeenCalled();
  });

  it("navigates straight to the artist when a track credits only one", async () => {
    mockedContext.mockReturnValue(baseState);
    const { getByText } = await render(<MusicPlayerModalContent />);

    await fireEvent.press(getByText("Radiohead"));

    expect(mockOpenOptions).not.toHaveBeenCalled();
    expect(mockArtistInteraction).toHaveBeenCalledWith("ar1");
    expect(router.navigate).toHaveBeenCalledWith("/(tabs)/home/artists/ar1");
    expect(mockClose).toHaveBeenCalled();
  });

  it("opens the artist picker when a track credits several", async () => {
    mockedContext.mockReturnValue({
      ...baseState,
      currentTrack: makeTrack({
        artists: [
          makeArtistRef({ id: "ar1", name: "Radiohead" }),
          makeArtistRef({ id: "ar2", name: "Thom Yorke" }),
        ],
      }),
    });
    const { getByText } = await render(<MusicPlayerModalContent />);

    await fireEvent.press(getByText("Radiohead, Thom Yorke"));

    expect(mockOpenOptions).toHaveBeenCalledWith({
      type: SheetType.NOW_PLAYING_ARTISTS,
    });
    expect(mockClose).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it("navigates to the album it is playing from", async () => {
    mockedContext.mockReturnValue(baseState);
    const { getByText } = await render(<MusicPlayerModalContent />);

    await fireEvent.press(getByText("In Rainbows"));

    expect(mockAlbumInteraction).toHaveBeenCalledWith("al1");
    expect(router.navigate).toHaveBeenCalledWith("/(tabs)/home/albums/al1");
    expect(mockClose).toHaveBeenCalled();
  });

  it("navigates to the playlist it is playing from", async () => {
    mockedContext.mockReturnValue({
      ...baseState,
      source: { type: "playlist", id: "pl1", name: "Deep Cuts" },
    });
    const { getByText } = await render(<MusicPlayerModalContent />);

    expect(getByText("Playing from Playlist")).toBeTruthy();
    await fireEvent.press(getByText("Deep Cuts"));

    expect(mockPlaylistInteraction).toHaveBeenCalledWith("pl1");
    expect(router.navigate).toHaveBeenCalledWith("/(tabs)/home/playlists/pl1");
  });

  it("leaves the header inert when playback has no source", async () => {
    mockedContext.mockReturnValue({ ...baseState, source: null });
    const { getByText } = await render(<MusicPlayerModalContent />);

    await fireEvent.press(getByText("Playing Now"));

    expect(router.navigate).not.toHaveBeenCalled();
    expect(mockClose).not.toHaveBeenCalled();
  });
});
