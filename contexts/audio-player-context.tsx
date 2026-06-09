import { BASE_URL } from "@/api/client";
import { useAlbumCover } from "@/api/queries/albums";
import { trackApi } from "@/api/tracks";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Track } from "../types/tracks";

interface AudioPlayerContextValue {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: Error | null;
  loadTrack: (trackId: string) => Promise<void>;
  play: () => void;
  pause: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  moveTarget: (target: number) => void;
  currentTime: number;
  duration: number;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | undefined>(
  undefined,
);

const SKIP_SECONDS = 10;

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [seekTarget, setSeekTarget] = useState<number | null>(null);

  const { data: albumArtUrl } = useAlbumCover(currentTrack?.albumId);

  const seekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const player = useAudioPlayer(null, {
    updateInterval: 250,
  });

  const status = useAudioPlayerStatus(player);

  const loadTrack = async (trackId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const track = await trackApi.getById(trackId);

      if (player.playing) {
        player.pause();
      }

      setCurrentTrack(track);

      const token = await SecureStore.getItemAsync("accessToken");

      player.replace({
        uri: `${BASE_URL}/tracks/${track.id}/stream`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      player.play();

      player.setActiveForLockScreen(true, {
        title: track.title,
        artist: track.artistNames.join(""),
        albumTitle: track.albumName,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load track"));
      setCurrentTrack(null);
    } finally {
      setIsLoading(false);
    }
  };

  const play = () => {
    player?.play();
  };
  const pause = () => player?.pause();

  const clearSeekTarget = () => {
    setSeekTarget(null);
    if (seekTimer.current) {
      clearTimeout(seekTimer.current);
      seekTimer.current = null;
    }
  };

  const moveTarget = (target: number) => {
    if (!player) return;
    player.seekTo(target);
    setSeekTarget(target);
    if (seekTimer.current) clearTimeout(seekTimer.current);
    seekTimer.current = setTimeout(clearSeekTarget, 1500); // guaranteed unstick
  };

  const skipForward = () => {
    if (!player) return;
    const base = seekTarget ?? status.currentTime;
    moveTarget(Math.min(base + SKIP_SECONDS, status.duration));
  };

  const skipBackward = () => {
    if (!player) return;
    const base = seekTarget ?? status.currentTime;
    moveTarget(Math.max(base - SKIP_SECONDS, 0));
  };

  useEffect(() => {
    if (seekTarget === null) return;
    if (Math.abs(status.currentTime - seekTarget) < 1.25) {
      clearSeekTarget();
    }
  }, [status.currentTime, seekTarget]);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    });
  }, []);

  const effectiveTime = seekTarget ?? status.currentTime;

  const value = {
    currentTrack,
    isPlaying: status.playing,
    isLoading,
    error,
    loadTrack,
    play,
    pause,
    skipForward,
    skipBackward,
    moveTarget,
    currentTime: effectiveTime,
    duration: status.duration,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayerContext = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error(
      "useAudioPlayerContext must be used within AudioPlayerProvider",
    );
  }
  return context;
};
