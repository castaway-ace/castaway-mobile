import {
  useActiveTrackStar,
  usePlayPause,
} from "@/components/player/useNowPlayingControls";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { act, renderHook } from "@/test-utils/renderWithProviders";

const mockTrackStar = jest.fn();

jest.mock("@/contexts/audioPlayerContext", () => ({
  useAudioPlayerContext: jest.fn(),
}));

jest.mock("@/api/tracks/mutations", () => ({
  useTrackStar: () => ({ mutate: mockTrackStar }),
}));

jest.mock("@/api/tracks/queries", () => ({
  useTrack: () => ({ data: { starred: true } }),
}));

const mockedContext = useAudioPlayerContext as jest.Mock;

describe("usePlayPause", () => {
  it("plays when paused", async () => {
    const play = jest.fn();
    const pause = jest.fn();
    mockedContext.mockReturnValue({ isPlaying: false, play, pause });

    const { result } = await renderHook(() => usePlayPause());
    result.current();

    expect(play).toHaveBeenCalledTimes(1);
    expect(pause).not.toHaveBeenCalled();
  });

  it("pauses when playing", async () => {
    const play = jest.fn();
    const pause = jest.fn();
    mockedContext.mockReturnValue({ isPlaying: true, play, pause });

    const { result } = await renderHook(() => usePlayPause());
    result.current();

    expect(pause).toHaveBeenCalledTimes(1);
    expect(play).not.toHaveBeenCalled();
  });
});

describe("useActiveTrackStar", () => {
  it("reflects the active track's starred state and toggles it", async () => {
    mockedContext.mockReturnValue({ currentTrack: { id: "tk1" } });

    const { result } = await renderHook(() => useActiveTrackStar());

    expect(result.current.starred).toBe(true);

    await act(async () => result.current.toggleStar());

    expect(mockTrackStar).toHaveBeenCalledWith(
      { id: "tk1", starred: true },
      expect.objectContaining({ onSettled: expect.any(Function) }),
    );
  });

  it("prefers trackId over id for playlist tracks and guards concurrent toggles", async () => {
    mockedContext.mockReturnValue({
      currentTrack: { trackId: "t9", id: "pt1" },
    });

    const { result } = await renderHook(() => useActiveTrackStar());

    await act(async () => {
      result.current.toggleStar();
      result.current.toggleStar();
    });

    expect(mockTrackStar).toHaveBeenCalledTimes(1);
    expect(mockTrackStar).toHaveBeenCalledWith(
      { id: "t9", starred: true },
      expect.anything(),
    );
  });
});
