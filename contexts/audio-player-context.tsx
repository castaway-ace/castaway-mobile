import { baseUrl } from "@/api/client";
import { trackApi } from "@/api/tracks";
import { TrackDto } from "@/types/tracks";
import { useAudioPlayer } from "expo-audio";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./auth-context";

interface AudioPlayerContextValue {
  currentTrack: TrackDto | null;
  isPlaying: boolean;
  loadTrack: (trackId: string) => Promise<void>;
  play: () => void;
  pause: () => void;
  stop: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | undefined>(
  undefined,
);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<TrackDto | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { accessToken } = useAuth();

  const player = useAudioPlayer(null, {
    updateInterval: 1000,
  });

  useEffect(() => {
    if (player) {
      setIsPlaying(player.playing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.playing]);

  const loadTrack = async (trackId: string) => {
    const track = await trackApi.getById(trackId);

    if (player?.playing) {
      player.pause();
    }
    setCurrentTrack(track);
    const streamUrl = `${baseUrl}/music/tracks/${track.id}/stream`;
    player.replace({
      uri: streamUrl,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    play();
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

  const stop = () => {
    if (player) {
      player.pause();
      setIsPlaying(false);
    }
    setCurrentTrack(null);
  };

  const value = {
    currentTrack,
    isPlaying,
    loadTrack,
    play,
    pause,
    stop,
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
