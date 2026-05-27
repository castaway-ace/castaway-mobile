import { trackApi } from "@/api/tracks";
import { useAudioPlayer } from "expo-audio";
import { createContext, ReactNode, useContext, useState } from "react";
import { albumApi } from "../api/albums";
import { Track } from "../types/tracks";

interface AudioPlayerContextValue {
  currentTrack: Track | null;
  coverArt: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: Error | null;
  loadTrack: (trackId: string) => Promise<void>;
  play: () => void;
  pause: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | undefined>(
  undefined,
);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [coverArt, setCoverArt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const player = useAudioPlayer(null, {
    updateInterval: 1000,
  });

  const loadTrack = async (trackId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const [track, streamUrl] = await Promise.all([
        trackApi.getById(trackId),
        trackApi.getStream(trackId),
      ]);

      const albumArt = await albumApi.getStream(track.albumId);

      if (player.playing) {
        player.pause();
      }

      setCurrentTrack(track);
      setCoverArt(albumArt);

      player.replace({ uri: streamUrl });
      player.play();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load track"));
      setCurrentTrack(null);
    } finally {
      setIsLoading(false);
    }
  };

  const play = () => {
    if (player) {
      player.play();
    }
  };

  const pause = () => {
    if (player) {
      player.pause();
    }
  };

  const value = {
    currentTrack,
    coverArt,
    isPlaying: player.playing,
    isLoading,
    error,
    loadTrack,
    play,
    pause,
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
