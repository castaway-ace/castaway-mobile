import MusicPlayer from "@/components/player/musicPlayer";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { makeArtistRef, makeTrack } from "@/test-utils/fixtures";
import { fireEvent, render } from "@/test-utils/renderWithProviders";

const mockOpen = jest.fn();
const mockToggleStar = jest.fn();
const mockPlayPause = jest.fn();
const mockSkipNext = jest.fn();
const mockSkipPrevious = jest.fn();

jest.mock("@/components/player/crossfadeIcon", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    CrossfadeIcon: ({ name }: { name?: string }) =>
      React.createElement(Text, null, name),
  };
});
jest.mock("@/contexts/audioPlayerContext", () => ({
  useAudioPlayerContext: jest.fn(),
}));
jest.mock("@/contexts/playerModalContext", () => ({
  usePlayerModal: () => ({ open: mockOpen }),
}));
jest.mock("@/components/player/useNowPlayingControls", () => ({
  useActiveTrackStar: () => ({ starred: false, toggleStar: mockToggleStar }),
  usePlayPause: () => mockPlayPause,
}));

const mockedContext = useAudioPlayerContext as jest.Mock;

const track = makeTrack({
  id: "tk1",
  title: "Weird Fishes",
  artists: [makeArtistRef({ name: "Radiohead" })],
});

const baseState = {
  isPlaying: false,
  isLoading: false,
  currentTrack: track,
  previousTrack: null,
  nextTrack: null,
  skipNext: mockSkipNext,
  skipPrevious: mockSkipPrevious,
  coverArtUrl: "https://cover.jpg",
  coverColor: "#123456",
  currentTime: 30,
  duration: 120,
};

describe("MusicPlayer", () => {
  it("renders nothing when there is no current track", async () => {
    mockedContext.mockReturnValue({ ...baseState, currentTrack: null });
    const { toJSON } = await render(<MusicPlayer />);
    expect(toJSON()).toBeNull();
  });

  it("renders the current track and controls", async () => {
    mockedContext.mockReturnValue(baseState);
    const { getByText } = await render(<MusicPlayer />);

    expect(getByText("Weird Fishes")).toBeTruthy();
    expect(getByText("Radiohead")).toBeTruthy();
    expect(getByText("heart")).toBeTruthy();
    expect(getByText("play.fill")).toBeTruthy();
  });

  it("toggles star, play/pause, and opens the full player", async () => {
    mockedContext.mockReturnValue(baseState);
    const { getByText } = await render(<MusicPlayer />);

    await fireEvent.press(getByText("heart"));
    expect(mockToggleStar).toHaveBeenCalled();

    await fireEvent.press(getByText("play.fill"));
    expect(mockPlayPause).toHaveBeenCalled();

    await fireEvent.press(getByText("Weird Fishes"));
    expect(mockOpen).toHaveBeenCalled();
  });

  it("shows the pause icon while playing", async () => {
    mockedContext.mockReturnValue({ ...baseState, isPlaying: true });
    const { getByText } = await render(<MusicPlayer />);
    expect(getByText("pause.fill")).toBeTruthy();
  });
});
