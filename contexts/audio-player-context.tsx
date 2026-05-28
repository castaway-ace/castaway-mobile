import { BASE_URL } from "@/api/client";
import { trackApi } from "@/api/tracks";
import { useAudioPlayer } from "expo-audio";
import { createContext, ReactNode, useContext, useState } from "react";
import { Track } from "../types/tracks";
import { useAuth } from "./auth-context";

interface AudioPlayerContextValue {
  currentTrack: Track | null;
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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const player = useAudioPlayer(null, {
    updateInterval: 1000,
  });

  const loadTrack = async (trackId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const track = await trackApi.getById(trackId);

      if (player.playing) {
        player.pause();
        setIsPlaying(false);
      }

      setCurrentTrack(track);

      player.replace({
        uri: `${BASE_URL}/tracks/${track.id}/stream`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setIsPlaying(true);
      player.play();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load track"));
      setCurrentTrack(null);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const play = () => {
    if (player) {
      player.play();
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (player) {
      player.pause();
      setIsPlaying(false);
    }
  };

  const value = {
    currentTrack,
    isPlaying,
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
