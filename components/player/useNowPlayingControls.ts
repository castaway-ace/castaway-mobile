import { useTrackStar } from "@/api/tracks/mutations";
import { useTrack } from "@/api/tracks/queries";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { useCallback, useRef } from "react";

/**
 * Star state and toggle for whichever track is currently playing.
 *
 * @remarks
 * Resolves the active track's id across the different queue shapes (playlist
 * entries expose `trackId`, everything else `id`) and reads its authoritative
 * starred flag from the track detail query rather than the lighter queue entry,
 * which may not carry it. The `inFlight` ref debounces rapid taps: without it a
 * double tap could fire star and unstar back-to-back and leave the server and
 * optimistic UI disagreeing. It's a ref, not state, because it must gate
 * synchronously without triggering a re-render.
 */
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
        // Release the guard once settled (success or failure) so the next tap
        // is accepted.
        onSettled: () => {
          inFlight.current = false;
        },
      },
    );
  }, [activeTrackId, starred, trackStar]);

  return { starred, toggleStar };
};

/**
 * Returns a single handler that toggles play/pause based on the current state —
 * so play/pause buttons don't each duplicate the branch.
 */
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
