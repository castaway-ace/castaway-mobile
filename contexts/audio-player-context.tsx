import { Track } from "@/types/tracks";
import { useAudioPlayer } from "expo-audio";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AudioPlayerContextValue {
  currentTrack: Track | null;
  isPlaying: boolean;
  loadTrack: (track: Track) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | undefined>(
  undefined,
);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const player = useAudioPlayer(currentTrack?.trackUrl, {
    updateInterval: 1000,
    downloadFirst: true,
  });

  // Monitor playing state
  useEffect(() => {
    if (player) {
      setIsPlaying(player.playing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.playing]);

  const loadTrack = (track: Track) => {
    if (player?.playing) {
      player.pause();
    }
    setCurrentTrack(track);
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
