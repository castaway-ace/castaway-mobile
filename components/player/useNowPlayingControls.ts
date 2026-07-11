import { useTrackStar } from "@/api/tracks/mutations";
import { useTrack } from "@/api/tracks/queries";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { useCallback, useRef } from "react";

export const useActiveTrackStar = () => {
  const { currentTrack } = useAudioPlayerContext();
  const { mutate: trackStar } = useTrackStar();
  const inFlight = useRef(false);

  const activeTrackId = currentTrack
    ? "trackId" in currentTrack
      ? currentTrack.trackId
      : currentTrack.id
    : undefined;

  const { data: trackDetail } = useTrack(activeTrackId);
  const starred = !!trackDetail?.starred;

  const toggleStar = useCallback(() => {
    if (!activeTrackId || inFlight.current) return;
    inFlight.current = true;
    trackStar(
      { id: activeTrackId, starred },
      {
        onSettled: () => {
          inFlight.current = false;
        },
      },
    );
  }, [activeTrackId, starred, trackStar]);

  return { starred, toggleStar };
};

export const usePlayPause = () => {
  const { isPlaying, play, pause } = useAudioPlayerContext();

  return useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);
};
