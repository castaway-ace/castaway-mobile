import type { AlbumTrack } from "@/types/albums";

/** A disc's worth of tracks, each paired with its index in the flat album list. */
export interface DiscGroup {
  discNumber: number;
  /**
   * `index` addresses the original `album.tracks` array — required so playback
   * still starts on the right track once the list is visually split by disc.
   */
  tracks: { track: AlbumTrack; index: number }[];
}

/**
 * Group an album's tracks into ordered disc sections.
 *
 * @remarks
 * Groups come back sorted by disc number ascending; track order *within* a disc
 * is preserved as the backend returned it. Each track keeps its original index
 * into the flat `album.tracks` array so callers can start playback from the
 * right position without re-deriving it. A result of length 1 is a single-disc
 * album, letting callers skip per-disc headers. A missing `discNumber` reads as
 * disc 1.
 */
export const groupTracksByDisc = (tracks: AlbumTrack[]): DiscGroup[] => {
  const byDisc = new Map<number, DiscGroup["tracks"]>();
  tracks.forEach((track, index) => {
    const disc = track.discNumber ?? 1;
    const group = byDisc.get(disc) ?? [];
    group.push({ track, index });
    byDisc.set(disc, group);
  });
  return Array.from(byDisc.entries())
    .sort(([a], [b]) => a - b)
    .map(([discNumber, discTracks]) => ({ discNumber, tracks: discTracks }));
};
