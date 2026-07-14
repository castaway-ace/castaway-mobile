import {
  AudioPlayerProvider,
  useAudioPlayerContext,
} from "@/contexts/audioPlayerContext";
import { makeTrackSummary } from "@/test-utils/fixtures";
import { act, renderHook, waitFor } from "@/test-utils/renderWithProviders";

// Mutable so tests can drive the engine's reported status (e.g. a load error)
// and re-render to exercise the effects that react to it.
const mockStatus = {
  isLoaded: false,
  playing: false,
  didJustFinish: false,
  currentTime: 0,
  duration: 0,
  error: null as string | null,
};

jest.mock("expo-audio", () => {
  const player = {
    replace: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn(),
    setActiveForLockScreen: jest.fn(),
    updateLockScreenMetadata: jest.fn(),
    clearLockScreenControls: jest.fn(),
  };
  return {
    useAudioPlayer: () => player,
    useAudioPlayerStatus: () => mockStatus,
    setAudioModeAsync: jest.fn(),
  };
});

jest.mock("react-native-image-colors", () => ({
  getColors: jest.fn().mockResolvedValue({ platform: "ios", primary: "#fff" }),
}));

jest.mock("@/api/albums/queries", () => ({
  useAlbumCover: () => ({ data: undefined }),
}));

const tracks = [
  makeTrackSummary({ id: "t0" }),
  makeTrackSummary({ id: "t1" }),
  makeTrackSummary({ id: "t2" }),
];

const renderPlayer = () =>
  renderHook(() => useAudioPlayerContext(), { wrapper: AudioPlayerProvider });

beforeEach(() => {
  mockStatus.isLoaded = false;
  mockStatus.playing = false;
  mockStatus.didJustFinish = false;
  mockStatus.currentTime = 0;
  mockStatus.duration = 0;
  mockStatus.error = null;
});

describe("audioPlayerContext queue", () => {
  it("plays a queue starting at the given index", async () => {
    const { result } = await renderPlayer();

    await act(async () => result.current.playQueue(tracks, 1));

    expect(result.current.currentTrack?.id).toBe("t1");
    expect(result.current.queue).toHaveLength(3);
    expect(result.current.position).toBe(1);
  });

  it("advances to the next track", async () => {
    const { result } = await renderPlayer();

    await act(async () => result.current.playQueue(tracks, 0));
    await act(async () => result.current.next());

    expect(result.current.currentTrack?.id).toBe("t1");
  });

  it("clears the queue at the end when repeat is off", async () => {
    const { result } = await renderPlayer();

    await act(async () => result.current.playQueue([tracks[0]], 0));
    await act(async () => result.current.next());

    expect(result.current.currentTrack).toBeNull();
  });

  it("steps to the previous track", async () => {
    const { result } = await renderPlayer();

    await act(async () => result.current.playQueue(tracks, 1));
    await act(async () => result.current.previous());

    expect(result.current.currentTrack?.id).toBe("t0");
  });

  it("cycles repeat mode off -> all -> one -> off", async () => {
    const { result } = await renderPlayer();

    expect(result.current.repeatMode).toBe("off");
    await act(async () => result.current.cycleRepeat());
    expect(result.current.repeatMode).toBe("all");
    await act(async () => result.current.cycleRepeat());
    expect(result.current.repeatMode).toBe("one");
    await act(async () => result.current.cycleRepeat());
    expect(result.current.repeatMode).toBe("off");
  });

  it("sets a specific repeat mode", async () => {
    const { result } = await renderPlayer();
    await act(async () => result.current.setRepeatMode("one"));
    expect(result.current.repeatMode).toBe("one");
  });

  it("toggles shuffle", async () => {
    const { result } = await renderPlayer();
    expect(result.current.isShuffled).toBe(false);
    await act(async () => result.current.toggleShuffle());
    expect(result.current.isShuffled).toBe(true);
  });

  it("enqueues a track into an empty queue and positions at it", async () => {
    const { result } = await renderPlayer();
    await act(async () => result.current.addToQueue(tracks[0]));

    expect(result.current.currentTrack?.id).toBe("t0");
    expect(result.current.queue).toHaveLength(1);
  });

  it("clears the queue", async () => {
    const { result } = await renderPlayer();
    await act(async () => result.current.playQueue(tracks, 0));
    await act(async () => result.current.clearQueue());

    expect(result.current.currentTrack).toBeNull();
    expect(result.current.queue).toHaveLength(0);
  });
});

describe("audioPlayerContext errors", () => {
  it("surfaces an engine error and clears the stuck loading state", async () => {
    const { result, rerender } = await renderPlayer();

    // Starting a track flips isLoading on; the mock never reports `isLoaded`, so
    // without the error effect it would spin forever once the load fails.
    await act(async () => result.current.playQueue(tracks, 0));
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.error).toBeNull();

    // The native engine reports the stream failed (e.g. a 401 it fetched itself).
    await act(async () => {
      mockStatus.error = "The operation couldn't be completed";
      await rerender(undefined);
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error?.message).toBe(
      "The operation couldn't be completed",
    );
    expect(result.current.isLoading).toBe(false);
  });
});
