import { useAlbumCover } from "@/api/albums/queries";
import { BASE_URL, getValidAccessToken } from "@/api/client";
import { trackApi } from "@/api/tracks/api";
import { AlbumTrack } from "@/types/albums";
import { PlaylistTrack } from "@/types/playlist";
import { Track, TrackSummary } from "@/types/tracks";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { ImageColorsResult } from "react-native-image-colors";
import { getColors } from "react-native-image-colors";

/** Repeat behavior when a track ends: no repeat, loop the queue, or loop one track. */
export type RepeatMode = "off" | "all" | "one";

/**
 * Any track shape the player can enqueue.
 *
 * @remarks
 * Tracks reach the player from three different screens, each with its own row
 * type. The player only relies on the fields common to all three (id, title,
 * artists, album), so the union is accepted directly rather than forcing every
 * caller to map into one canonical shape first.
 */
export type PlayableTrack = TrackSummary | AlbumTrack | PlaylistTrack;

export type PlaybackSourceType = "album" | "playlist";

/**
 * Where the current queue came from, so the player UI can show "Playing from …"
 * and link back to it.
 */
export interface PlaybackSource {
  type: PlaybackSourceType;
  /** Id of the album or playlist, per {@link PlaybackSource.type}. */
  id: string;
  name: string;
}

/** Everything the player exposes to the app: current state plus imperative controls. */
interface AudioPlayerContextValue {
  currentTrack: PlayableTrack | null;
  coverArtUrl: string | undefined;
  /** Dominant color extracted from the cover art, used to tint the player background. */
  coverColor: string | undefined;
  queue: PlayableTrack[];
  /** Tracks after the current one, already reordered for shuffle. */
  upNext: PlayableTrack[];
  /**
   * The track a forward skip would land on, wrapping to the start from the end;
   * `null` when there is no other track to reach.
   */
  nextTrack: PlayableTrack | null;
  /**
   * The track a backward skip would land on, wrapping to the end from the start;
   * `null` when there is no other track to reach.
   */
  previousTrack: PlayableTrack | null;
  /** Index into the play order (not the raw queue); `-1` when nothing is playing. */
  position: number;
  source: PlaybackSource | null;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  isPlaying: boolean;
  isLoading: boolean;
  error: Error | null;
  /** Playback position in seconds; reflects an in-progress seek before the engine catches up. */
  currentTime: number;
  duration: number;
  /** Loads a single track by id (e.g. from a deep link) as a one-item queue. */
  loadTrack: (trackId: string) => Promise<void>;
  /** Replaces the queue with `tracks` and starts playback at `startIndex`. */
  playQueue: (
    tracks: PlayableTrack[],
    startIndex?: number,
    source?: PlaybackSource | null,
  ) => void;
  addToQueue: (track: PlayableTrack) => void;
  clearQueue: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  /** Restarts the current track, or steps back if already near its start. */
  previous: () => void;
  /** Forward skip for the swipe gesture. No-ops when {@link AudioPlayerContextValue.nextTrack} is null. */
  skipNext: () => void;
  /**
   * Backward skip for the swipe gesture: always steps back, bypassing the
   * restart-near-the-start rule {@link AudioPlayerContextValue.previous} applies.
   */
  skipPrevious: () => void;
  toggleShuffle: () => void;
  /** Advances repeat mode: off → all → one → off. */
  cycleRepeat: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  /** Seeks to `target` seconds and optimistically reflects it in `currentTime`. */
  moveTarget: (target: number) => void;
}

// How far into a track "previous" still restarts it instead of stepping back —
// matches the familiar behavior of hardware media controls.
const RESTART_THRESHOLD_SECONDS = 3;

/**
 * Internal queue model.
 *
 * @remarks
 * `queue` holds tracks in their original order and never changes on shuffle;
 * `order` is a list of indices *into* `queue` that defines actual play order,
 * and `position` indexes into `order`. Keeping the tracks and the ordering
 * separate means toggling shuffle only rebuilds `order` — the queue itself is
 * untouched, so turning shuffle back off restores the original sequence for free.
 */
interface QueueState {
  /** Tracks in original (unshuffled) order. */
  queue: PlayableTrack[];
  /** Indices into {@link QueueState.queue} defining play order. */
  order: number[];
  /** Index into {@link QueueState.order}; `-1` when the queue is empty. */
  position: number;
  source: PlaybackSource | null;
  isShuffled: boolean;
  repeatMode: RepeatMode;
}

type QueueAction =
  | {
      type: "SET_QUEUE";
      tracks: PlayableTrack[];
      startIndex: number;
      source: PlaybackSource | null;
    }
  | { type: "NEXT"; naturalEnd: boolean }
  | { type: "PREVIOUS" }
  | { type: "ENQUEUE"; track: PlayableTrack }
  | { type: "TOGGLE_SHUFFLE" }
  | { type: "CYCLE_REPEAT" }
  | { type: "SET_REPEAT"; mode: RepeatMode }
  | { type: "CLEAR" };

const initialQueueState: QueueState = {
  queue: [],
  order: [],
  position: -1,
  source: null,
  isShuffled: false,
  repeatMode: "off",
};

/** `[0, 1, …, length-1]` — the play order for an unshuffled queue. */
const identityIndices = (length: number): number[] =>
  Array.from({ length }, (_, i) => i);

/**
 * A shuffled permutation of `[0, length)` using Fisher–Yates.
 *
 * @param keepFirst - Optional queue index to pin to the front. When shuffle is
 * toggled on mid-playback we want the *current* track to stay put and only the
 * upcoming tracks to be randomized, so it's moved to position 0 after the
 * shuffle rather than left wherever chance placed it.
 */
const shuffleIndices = (length: number, keepFirst?: number): number[] => {
  const indices = identityIndices(length);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  if (keepFirst !== undefined) {
    const at = indices.indexOf(keepFirst);
    if (at > 0) {
      indices.splice(at, 1);
      indices.unshift(keepFirst);
    }
  }
  return indices;
};

/**
 * Pure state machine for the queue. All queue transitions go through here so the
 * play order, position, shuffle, and repeat rules live in one testable place,
 * separate from the side-effecting audio engine in the provider.
 */
const queueReducer = (state: QueueState, action: QueueAction): QueueState => {
  switch (action.type) {
    case "SET_QUEUE": {
      const { tracks, startIndex, source } = action;
      if (tracks.length === 0) {
        return { ...state, queue: [], order: [], position: -1, source: null };
      }
      // Preserve the active shuffle setting for the new queue, pinning the
      // chosen start track to the front of the shuffled order.
      const order = state.isShuffled
        ? shuffleIndices(tracks.length, startIndex)
        : identityIndices(tracks.length);
      return {
        ...state,
        queue: tracks,
        order,
        // `startIndex` addresses the raw queue, so translate it into a position
        // within the (possibly shuffled) play order.
        position: order.indexOf(startIndex),
        source,
      };
    }

    case "NEXT": {
      const length = state.order.length;
      if (length === 0) return state;
      const nextPos = state.position + 1;
      if (nextPos < length) return { ...state, position: nextPos };
      // Ran off the end. A natural end with no repeat parks on the last track:
      // the engine has already stopped there, so leaving state untouched keeps
      // the queue and player intact rather than making them vanish mid-listen.
      if (action.naturalEnd && state.repeatMode === "off") return state;
      // Any manual skip wraps, repeat or not — the end of a queue is never a
      // dead end the user can't skip out of. Repeat mode governs only what
      // happens on a natural end.
      return { ...state, position: 0 };
    }

    case "PREVIOUS": {
      const length = state.order.length;
      if (length === 0) return state;
      const prevPos = state.position - 1;
      // Wraps regardless of repeat mode, mirroring NEXT.
      return { ...state, position: prevPos >= 0 ? prevPos : length - 1 };
    }

    case "ENQUEUE": {
      const queue = [...state.queue, action.track];
      // Appended track keeps original order; its play-order entry points at the
      // new tail regardless of shuffle. If nothing was playing, start on it.
      const order = [...state.order, queue.length - 1];
      const position = state.position === -1 ? 0 : state.position;
      return { ...state, queue, order, position };
    }

    case "TOGGLE_SHUFFLE": {
      const nextShuffled = !state.isShuffled;
      if (state.queue.length === 0)
        return { ...state, isShuffled: nextShuffled };
      // Rebuild only the play order, keeping the current track under the
      // playhead: shuffle re-randomizes what comes next, un-shuffle restores the
      // original sequence, and either way playback continues uninterrupted.
      const currentTrackIndex = state.order[state.position];
      const order = nextShuffled
        ? shuffleIndices(state.queue.length, currentTrackIndex)
        : identityIndices(state.queue.length);
      return {
        ...state,
        isShuffled: nextShuffled,
        order,
        position: order.indexOf(currentTrackIndex),
      };
    }

    case "CYCLE_REPEAT": {
      const cycle: RepeatMode[] = ["off", "all", "one"];
      const idx = cycle.indexOf(state.repeatMode);
      return { ...state, repeatMode: cycle[(idx + 1) % cycle.length] };
    }

    case "SET_REPEAT":
      return { ...state, repeatMode: action.mode };

    case "CLEAR":
      return { ...state, queue: [], order: [], position: -1, source: null };

    default:
      return state;
  }
};

/**
 * Picks a single tint color from a cover image's extracted palette.
 *
 * @remarks
 * `react-native-image-colors` returns a differently-shaped result per platform,
 * so each branch reads the fields that exist there and falls back through
 * progressively safer choices to guarantee a defined color.
 */
const pickCoverColor = (result: ImageColorsResult): string => {
  switch (result.platform) {
    case "android":
      return result.vibrant || result.dominant || result.muted;
    case "ios":
      return result.primary || result.background;
    default:
      return result.vibrant || result.darkVibrant || result.dominant;
  }
};

/**
 * Narrows a full {@link Track} down to the {@link TrackSummary} the queue stores.
 *
 * @remarks
 * {@link loadTrack} fetches a complete track, but the queue holds the lighter
 * summary shape shared with tracks that arrive from list screens; this keeps
 * every queue entry uniform regardless of where it came from.
 */
const toTrackSummary = (track: Track): TrackSummary => ({
  id: track.id,
  title: track.title,
  releaseDate: track.releaseDate,
  genres: track.genres,
  duration: track.duration,
  album: track.album,
  artists: track.artists,
  trackNumber: track.trackNumber,
  starred: track.starred,
});

const AudioPlayerContext = createContext<AudioPlayerContextValue | undefined>(
  undefined,
);

/**
 * App-wide audio playback provider.
 *
 * @remarks
 * Owns the single {@link useAudioPlayer} engine instance and bridges it to the
 * queue state machine: the reducer decides *what* should play, and the effects
 * below drive the engine, lock-screen controls, and cover-color extraction to
 * match. Mounted once near the app root so playback and the mini-player survive
 * navigation between tabs and screens.
 */
export const AudioPlayerProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const [queueState, dispatch] = useReducer(queueReducer, initialQueueState);
  const { queue, order, position, source, isShuffled, repeatMode } = queueState;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // Optimistic scrub position: set the instant the user seeks so the progress
  // bar tracks their finger, then cleared once the engine reports it has caught
  // up (see `moveTarget` and the reconciliation effect below).
  const [seekTarget, setSeekTarget] = useState<number | null>(null);

  const seekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards against `didJustFinish` firing repeatedly for one track end, which
  // would otherwise advance the queue several tracks at once.
  const finishHandledRef = useRef(false);
  // Latches the last engine error already surfaced, so one failure is reported
  // once even though status re-polls the same `error` across frames.
  const streamErrorRef = useRef<string | null>(null);

  // Poll status four times a second — frequent enough for a smooth progress bar
  // without the overhead of the engine's default tighter interval.
  const player = useAudioPlayer(null, {
    updateInterval: 250,
  });

  const status = useAudioPlayerStatus(player);

  // Two-phase load: `replace` is async, so we flag intent to play here and
  // actually start once the engine reports the new source is loaded (below).
  const [shouldPlay, setShouldPlay] = useState(false);

  const currentTrack = useMemo<PlayableTrack | null>(() => {
    if (position < 0 || order[position] === undefined) return null;
    return queue[order[position]] ?? null;
  }, [queue, order, position]);

  const upNext = useMemo<PlayableTrack[]>(() => {
    if (position < 0) return [];
    return order.slice(position + 1).map((i) => queue[i]);
  }, [queue, order, position]);

  // The tracks a manual skip would land on. Deliberately not `upNext[0]`: that's
  // the literal remainder of the queue and stops at the end, whereas a skip
  // wraps. Both derive from `order`, so they're shuffle-aware for free.
  //
  // A one-track queue reports null in both directions: NEXT/PREVIOUS resolve to
  // the position already held, so `currentTrack`'s identity never changes and
  // the dispatch is a silent no-op. Null lets the swipe refuse up front instead
  // of animating to a track it can't actually reach.
  const nextTrack = useMemo<PlayableTrack | null>(() => {
    if (position < 0 || order.length <= 1) return null;
    const at = position + 1 < order.length ? position + 1 : 0;
    return queue[order[at]] ?? null;
  }, [queue, order, position]);

  const previousTrack = useMemo<PlayableTrack | null>(() => {
    if (position < 0 || order.length <= 1) return null;
    const at = position - 1 >= 0 ? position - 1 : order.length - 1;
    return queue[order[at]] ?? null;
  }, [queue, order, position]);

  const { data: albumArtUrl } = useAlbumCover(currentTrack?.album.id);

  const [coverColor, setCoverColor] = useState<string | undefined>(undefined);

  // Extract the tint color whenever the cover art changes. The `cancelled`
  // flag drops a late result if the art changes again before extraction
  // finishes, so a slow older image can't overwrite the current color.
  useEffect(() => {
    if (!albumArtUrl) return;
    let cancelled = false;
    getColors(albumArtUrl, { cache: true, key: albumArtUrl })
      .then((result) => {
        if (!cancelled) {
          setCoverColor(pickCoverColor(result));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [albumArtUrl]);

  // Configure the OS audio session once: keep playing in silent mode and in the
  // background, and take exclusive focus rather than ducking under other apps.
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    });
  }, []);

  const playTrack = useCallback(
    async (track: PlayableTrack): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        // The stream endpoint is authenticated, so the token is attached
        // directly to the media request here — the engine fetches the audio
        // itself and never passes through the Axios client's interceptors.
        // Because it bypasses those interceptors, it also bypasses their
        // refresh-on-401, so use the token the client vouches is fresh: during
        // long uninterrupted playback nothing else refreshes it, and a stale one
        // would silently fail to load the next track when the queue advances.
        const token = await getValidAccessToken();
        // Playlist entries expose the underlying track as `trackId`; other
        // shapes stream by their own `id`.
        const streamId = "trackId" in track ? track.trackId : track.id;
        player.replace({
          uri: `${BASE_URL}/tracks/${streamId}/stream`,
          headers: { Authorization: `Bearer ${token}` },
        });
        setShouldPlay(true);

        player.setActiveForLockScreen(true, {
          title: track.title,
          artist: track.artists?.map((artist) => artist.name)?.join(", "),
          albumTitle: track.album.title,
        });
      } catch (err) {
        setIsLoading(false);
        setError(
          err instanceof Error ? err : new Error("Failed to load track"),
        );
      }
    },
    [player],
  );

  // Phase two of the load: once the requested source has finished loading, start
  // playback and drop the loading state. Waiting on `isLoaded` avoids a race
  // where `play()` is called before `replace()` has swapped the source in.
  useEffect(() => {
    if (shouldPlay && status.isLoaded) {
      player.play();
      setShouldPlay(false);
      setIsLoading(false);
    }
  }, [shouldPlay, status.isLoaded, player]);

  // React to the current track changing: load and play it, or pause and tear
  // down the lock-screen controls when the queue empties.
  useEffect(() => {
    if (!currentTrack) {
      player.pause();
      player.clearLockScreenControls();
      return;
    }
    playTrack(currentTrack);
  }, [currentTrack, player, playTrack]);

  // Backfill the lock-screen artwork once it resolves. `playTrack` sets the text
  // metadata up front (before the art URL is known) so the controls appear
  // immediately; this patches in the artwork asynchronously when it arrives.
  useEffect(() => {
    if (!currentTrack || !albumArtUrl) return;
    player.updateLockScreenMetadata({
      title: currentTrack.title,
      artist: currentTrack.artists?.map((artist) => artist.name)?.join(", "),
      albumTitle: currentTrack.album.title,
      artworkUrl: albumArtUrl,
    });
  }, [albumArtUrl, currentTrack, player]);

  // Handle a track playing to its natural end. The ref latches so the transition
  // is handled exactly once (status can report `didJustFinish` across several
  // polls), and resets when playback moves off the finished frame. Repeat-one —
  // and repeat-all on a single-track queue — restarts in place; otherwise we
  // advance, marking it a natural end so repeat-one doesn't skip away.
  useEffect(() => {
    if (status.didJustFinish && !finishHandledRef.current) {
      finishHandledRef.current = true;
      const onlyOneTrack = order.length <= 1;
      const atEnd = order.length > 0 && position + 1 >= order.length;
      if (repeatMode === "one" || (repeatMode === "all" && onlyOneTrack)) {
        player.seekTo(0);
        player.play();
      } else if (repeatMode === "off" && atEnd) {
        // Park on the last track instead of advancing: the queue stays intact so
        // the player remains on screen and the listener can scrub back or replay.
        // Pausing explicitly rather than trusting the engine to have settled into
        // a stopped state on its own.
        player.pause();
      } else {
        dispatch({ type: "NEXT", naturalEnd: true });
      }
    } else if (!status.didJustFinish) {
      finishHandledRef.current = false;
    }
  }, [status.didJustFinish, repeatMode, order.length, position, player]);

  // Surface a load/playback failure the engine reports. The stream is fetched by
  // the native engine outside the Axios client, so a failure — a session whose
  // refresh also failed, a dropped connection, an unplayable source — arrives as
  // `status.error` rather than a thrown exception, and would otherwise be
  // invisible: the next track simply never starts. Record it so the UI can react
  // (see the toast bridge), and clear `isLoading`/`shouldPlay` so a track that
  // will never load doesn't leave the play button spinning forever. The ref
  // latches per message; it resets when `error` clears, which the engine does as
  // soon as a new source loads.
  useEffect(() => {
    if (status.error && status.error !== streamErrorRef.current) {
      streamErrorRef.current = status.error;
      setError(new Error(status.error));
      setIsLoading(false);
      setShouldPlay(false);
    } else if (!status.error) {
      streamErrorRef.current = null;
    }
  }, [status.error]);

  const loadTrack = useCallback(async (trackId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const track = await trackApi.getOne(trackId);
      dispatch({
        type: "SET_QUEUE",
        tracks: [toTrackSummary(track)],
        startIndex: 0,
        source: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load track"));
      setIsLoading(false);
    }
  }, []);

  const playQueue = useCallback(
    (
      tracks: PlayableTrack[],
      startIndex = 0,
      source: PlaybackSource | null = null,
    ): void => {
      dispatch({ type: "SET_QUEUE", tracks, startIndex, source });
    },
    [],
  );

  const addToQueue = useCallback((track: PlayableTrack): void => {
    dispatch({ type: "ENQUEUE", track });
  }, []);

  const clearQueue = useCallback((): void => {
    dispatch({ type: "CLEAR" });
  }, []);

  const play = useCallback((): void => {
    player.play();
  }, [player]);

  const pause = useCallback((): void => {
    player.pause();
  }, [player]);

  const next = useCallback((): void => {
    dispatch({ type: "NEXT", naturalEnd: false });
  }, []);

  const previous = useCallback((): void => {
    // Restart the current track rather than stepping back once we're past the
    // threshold — matching how physical media controls behave.
    if (status.currentTime > RESTART_THRESHOLD_SECONDS) {
      player.seekTo(0);
      return;
    }
    dispatch({ type: "PREVIOUS" });
  }, [status.currentTime, player]);

  const skipNext = useCallback((): void => {
    if (!nextTrack) return;
    dispatch({ type: "NEXT", naturalEnd: false });
  }, [nextTrack]);

  const skipPrevious = useCallback((): void => {
    // No restart-if-past-the-threshold rule here, unlike `previous`: the swipe
    // has already dragged the previous track's text into view, so restarting
    // would animate to a track and then silently not go there.
    if (!previousTrack) return;
    dispatch({ type: "PREVIOUS" });
  }, [previousTrack]);

  const toggleShuffle = useCallback((): void => {
    dispatch({ type: "TOGGLE_SHUFFLE" });
  }, []);

  const cycleRepeat = useCallback((): void => {
    dispatch({ type: "CYCLE_REPEAT" });
  }, []);

  const setRepeatMode = useCallback((mode: RepeatMode): void => {
    dispatch({ type: "SET_REPEAT", mode });
  }, []);

  const clearSeekTarget = useCallback((): void => {
    setSeekTarget(null);
    if (seekTimer.current) {
      clearTimeout(seekTimer.current);
      seekTimer.current = null;
    }
  }, []);

  const moveTarget = useCallback(
    (target: number): void => {
      player.seekTo(target);
      // Show the target immediately, then hold it until the engine catches up.
      // The timeout is a safety net: if status never reports a position near the
      // target (e.g. the seek is dropped), we still release the optimistic value
      // after 1.5s instead of freezing the progress bar.
      setSeekTarget(target);
      if (seekTimer.current) clearTimeout(seekTimer.current);
      seekTimer.current = setTimeout(clearSeekTarget, 1500);
    },
    [player, clearSeekTarget],
  );

  // Reconcile the optimistic seek with reality: once the engine's reported time
  // lands within ~1.25s of the target, stop overriding and defer to status.
  useEffect(() => {
    if (seekTarget === null) return;
    if (Math.abs(status.currentTime - seekTarget) < 1.25) {
      clearSeekTarget();
    }
  }, [status.currentTime, seekTarget, clearSeekTarget]);

  // Prefer the pending seek position while a scrub is settling, otherwise the
  // engine's real position.
  const effectiveTime = seekTarget ?? status.currentTime;

  const value: AudioPlayerContextValue = {
    currentTrack,
    coverArtUrl: albumArtUrl,
    coverColor,
    queue,
    upNext,
    nextTrack,
    previousTrack,
    position,
    source,
    isShuffled,
    repeatMode,
    isPlaying: status.playing,
    isLoading,
    error,
    currentTime: effectiveTime,
    duration: status.duration,
    loadTrack,
    playQueue,
    addToQueue,
    clearQueue,
    play,
    pause,
    next,
    previous,
    skipNext,
    skipPrevious,
    toggleShuffle,
    cycleRepeat,
    setRepeatMode,
    moveTarget,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

/**
 * Accessor for the audio player context.
 *
 * @returns The live player state and controls from the nearest
 * {@link AudioPlayerProvider}.
 * @throws {Error} When called outside a provider — a fail-fast signal that the
 * component tree is missing the provider, rather than silently handing back an
 * undefined context.
 */
export const useAudioPlayerContext = (): AudioPlayerContextValue => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error(
      "useAudioPlayerContext must be used within AudioPlayerProvider",
    );
  }
  return context;
};
