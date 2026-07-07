import { useTrackStar } from "@/api/tracks/mutations";
import { useTrack } from "@/api/tracks/queries";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { useCallback } from "react";

export function useActiveTrackStar() {
  const { currentTrack } = useAudioPlayerContext();
  const { mutate: trackStar } = useTrackStar();

  const activeTrackId = currentTrack
    ? "trackId" in currentTrack
      ? currentTrack.trackId
      : currentTrack.id
    : undefined;

  const { data: trackDetail } = useTrack(activeTrackId);
  const starred = !!trackDetail?.starred;

  const toggleStar = useCallback(() => {
    if (!activeTrackId) return;
    trackStar({ id: activeTrackId, starred });
  }, [activeTrackId, starred, trackStar]);

  return { starred, toggleStar };
}

export function usePlayPause() {
  const { isPlaying, play, pause } = useAudioPlayerContext();

  return useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);
}
