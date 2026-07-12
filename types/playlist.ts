import type { components } from "@/api/schema";

/**
 * Distinguishes hand-made playlists from the system-managed Liked Songs.
 *
 * @remarks
 * The generated schema types the playlist `type` field as a bare string, which
 * can't be narrowed. This local enum is the escape hatch: the `Playlist` types
 * below `Omit` the generated `type` and re-add it as this enum, so checks like
 * `playlist.type === PlaylistType.USER` (which gate edit/delete actions) are
 * exhaustive and type-safe.
 */
export enum PlaylistType {
  USER = "USER",
  LIKED = "LIKED",
}

/** Minimal reference (id) returned when a playlist is created. */
export type PlaylistRef = components["schemas"]["PlaylistRef"];

/** A single playlist, with the generated string `type` swapped for {@link PlaylistType}. */
export type Playlist = Omit<components["schemas"]["PlaylistEntity"], "type"> & {
  type: PlaylistType;
};

/** The lighter list shape, with the same {@link PlaylistType} override. */
export type PlaylistSummary = Omit<
  components["schemas"]["PlaylistSummaryEntity"],
  "type"
> & {
  type: PlaylistType;
};

/** A track as it appears within a playlist (carries the playlist-scoped entry id). */
export type PlaylistTrack = components["schemas"]["PlaylistTrackEntity"];
