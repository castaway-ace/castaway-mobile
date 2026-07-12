import MusicPlayerModalContent from "@/components/player/musicPlayerModal/content";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { SheetType } from "@/contexts/sheetModalContext";
import { makeArtistRef, makeTrack } from "@/test-utils/fixtures";
import { fireEvent, render } from "@/test-utils/renderWithProviders";

const mockClose = jest.fn();
const mockOpenOptions = jest.fn();
const mockNext = jest.fn();
const mockPrevious = jest.fn();
const mockToggleShuffle = jest.fn();
const mockCycleRepeat = jest.fn();
const mockToggleStar = jest.fn();
const mockPlayPause = jest.fn();

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

const mockedContext = useAudioPlayerContext as jest.Mock;

const track = makeTrack({
  id: "tk1",
  title: "Reckoner",
  artists: [makeArtistRef({ name: "Radiohead" })],
});

const baseState = {
  isPlaying: false,
  next: mockNext,
  previous: mockPrevious,
  currentTrack: track,
  coverArtUrl: "https://cover.jpg",
  coverColor: "#123456",
  source: { type: "album", name: "In Rainbows" },
  toggleShuffle: mockToggleShuffle,
  isShuffled: false,
  cycleRepeat: mockCycleRepeat,
  repeatMode: "off",
};

describe("MusicPlayerModalContent", () => {
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
});
