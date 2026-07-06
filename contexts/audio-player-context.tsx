import { BASE_URL } from "@/api/client";
import { useAlbumCover } from "@/api/queries/albums";
import { trackApi } from "@/api/tracks";
import { AlbumTrack } from "@/types/albums";
import { PlaylistTrack } from "@/types/playlist";
import { Track, TrackSummary } from "@/types/tracks";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import * as SecureStore from "expo-secure-store";
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

export type RepeatMode = "off" | "all" | "one";

export type PlayableTrack = TrackSummary | AlbumTrack | PlaylistTrack;

interface AudioPlayerContextValue {
  currentTrack: PlayableTrack | null;
  coverArtUrl: string | undefined;
  queue: PlayableTrack[];
  upNext: PlayableTrack[];
  position: number;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  isPlaying: boolean;
  isLoading: boolean;
  error: Error | null;
  currentTime: number;
  duration: number;
  loadTrack: (trackId: string) => Promise<void>;
  playQueue: (tracks: PlayableTrack[], startIndex?: number) => void;
  addToQueue: (track: PlayableTrack) => void;
  clearQueue: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  moveTarget: (target: number) => void;
}

const RESTART_THRESHOLD_SECONDS = 3;

interface QueueState {
  queue: PlayableTrack[];
  order: number[];
  position: number;
  isShuffled: boolean;
  repeatMode: RepeatMode;
}

type QueueAction =
  | { type: "SET_QUEUE"; tracks: PlayableTrack[]; startIndex: number }
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
  isShuffled: false,
  repeatMode: "off",
};

const identityIndices = (length: number): number[] =>
  Array.from({ length }, (_, i) => i);

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

const queueReducer = (state: QueueState, action: QueueAction): QueueState => {
  switch (action.type) {
    case "SET_QUEUE": {
      const { tracks, startIndex } = action;
      if (tracks.length === 0) {
        return { ...state, queue: [], order: [], position: -1 };
      }
      const order = state.isShuffled
        ? shuffleIndices(tracks.length, startIndex)
        : identityIndices(tracks.length);
      return {
        ...state,
        queue: tracks,
        order,
        position: order.indexOf(startIndex),
      };
    }

    case "NEXT": {
      const length = state.order.length;
      if (length === 0) return state;
      const wrap =
        state.repeatMode === "all" ||
        (!action.naturalEnd && state.repeatMode === "one");
      const nextPos = state.position + 1;
      if (nextPos < length) return { ...state, position: nextPos };
      if (wrap) return { ...state, position: 0 };
      return { ...state, queue: [], order: [], position: -1 };
    }

    case "PREVIOUS": {
      const length = state.order.length;
      if (length === 0) return state;
      const prevPos = state.position - 1;
      if (prevPos >= 0) return { ...state, position: prevPos };
      if (state.repeatMode !== "off") return { ...state, position: length - 1 };
      return state;
    }

    case "ENQUEUE": {
      const queue = [...state.queue, action.track];
      const order = [...state.order, queue.length - 1];
      const position = state.position === -1 ? 0 : state.position;
      return { ...state, queue, order, position };
    }

    case "TOGGLE_SHUFFLE": {
      const nextShuffled = !state.isShuffled;
      if (state.queue.length === 0)
        return { ...state, isShuffled: nextShuffled };
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
      return { ...state, queue: [], order: [], position: -1 };

    default:
      return state;
  }
};

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

export const AudioPlayerProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const [queueState, dispatch] = useReducer(queueReducer, initialQueueState);
  const { queue, order, position, isShuffled, repeatMode } = queueState;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [seekTarget, setSeekTarget] = useState<number | null>(null);

  const seekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishHandledRef = useRef(false);

  const player = useAudioPlayer(null, {
    updateInterval: 250,
  });

  const status = useAudioPlayerStatus(player);

  const [shouldPlay, setShouldPlay] = useState(false);

  const currentTrack = useMemo<PlayableTrack | null>(() => {
    if (position < 0 || order[position] === undefined) return null;
    return queue[order[position]] ?? null;
  }, [queue, order, position]);

  const upNext = useMemo<PlayableTrack[]>(() => {
    if (position < 0) return [];
    return order.slice(position + 1).map((i) => queue[i]);
  }, [queue, order, position]);

  const { data: albumArtUrl } = useAlbumCover(currentTrack?.album.id);

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
        const token = await SecureStore.getItemAsync("accessToken");
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

  useEffect(() => {
    if (shouldPlay && status.isLoaded) {
      player.play();
      setShouldPlay(false);
      setIsLoading(false);
    }
  }, [shouldPlay, status.isLoaded, player]);

  useEffect(() => {
    if (!currentTrack) {
      player.pause();
      player.clearLockScreenControls();
      return;
    }
    playTrack(currentTrack);
  }, [currentTrack, player, playTrack]);

  useEffect(() => {
    if (!currentTrack || !albumArtUrl) return;
    player.updateLockScreenMetadata({
      title: currentTrack.title,
      artist: currentTrack.artists?.map((artist) => artist.name)?.join(", "),
      albumTitle: currentTrack.album.title,
      artworkUrl: albumArtUrl,
    });
  }, [albumArtUrl, currentTrack, player]);

  useEffect(() => {
    if (status.didJustFinish && !finishHandledRef.current) {
      finishHandledRef.current = true;
      const onlyOneTrack = order.length <= 1;
      if (repeatMode === "one" || (repeatMode === "all" && onlyOneTrack)) {
        player.seekTo(0);
        player.play();
      } else {
        dispatch({ type: "NEXT", naturalEnd: true });
      }
    } else if (!status.didJustFinish) {
      finishHandledRef.current = false;
    }
  }, [status.didJustFinish, repeatMode, order.length, player]);

  const loadTrack = useCallback(async (trackId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const track = await trackApi.getOne(trackId);
      dispatch({
        type: "SET_QUEUE",
        tracks: [toTrackSummary(track)],
        startIndex: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load track"));
      setIsLoading(false);
    }
  }, []);

  const playQueue = useCallback(
    (tracks: PlayableTrack[], startIndex = 0): void => {
      dispatch({ type: "SET_QUEUE", tracks, startIndex });
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
    const atStart = position <= 0 && repeatMode === "off";
    if (status.currentTime > RESTART_THRESHOLD_SECONDS || atStart) {
      player.seekTo(0);
      return;
    }
    dispatch({ type: "PREVIOUS" });
  }, [position, repeatMode, status.currentTime, player]);

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
      setSeekTarget(target);
      if (seekTimer.current) clearTimeout(seekTimer.current);
      seekTimer.current = setTimeout(clearSeekTarget, 1500);
    },
    [player, clearSeekTarget],
  );

  useEffect(() => {
    if (seekTarget === null) return;
    if (Math.abs(status.currentTime - seekTarget) < 1.25) {
      clearSeekTarget();
    }
  }, [status.currentTime, seekTarget, clearSeekTarget]);

  const effectiveTime = seekTarget ?? status.currentTime;

  const value: AudioPlayerContextValue = {
    currentTrack,
    coverArtUrl: albumArtUrl,
    queue,
    upNext,
    position,
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

export const useAudioPlayerContext = (): AudioPlayerContextValue => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error(
      "useAudioPlayerContext must be used within AudioPlayerProvider",
    );
  }
  return context;
};
