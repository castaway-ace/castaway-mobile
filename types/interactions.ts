import type { components } from "@/api/schema";
import { PlaylistType } from "./playlist";

/**
 * Tags which entity an interaction refers to; the discriminant for the
 * {@link Interaction} union.
 *
 * @remarks
 * Same escape hatch as {@link PlaylistType}: the generated `type` field is a bare
 * string, so each interaction type below `Omit`s it and re-adds a specific enum
 * member. That turns {@link Interaction} into a proper discriminated union, so
 * branching on `interaction.type` narrows to the right payload (album/artist/
 * playlist) with exhaustiveness.
 */
export enum InteractionType {
  ALBUM = "album",
  ARTIST = "artist",
  PLAYLIST = "playlist",
}

/** A recent-engagement entry for an album. */
export type AlbumInteraction = Omit<
  components["schemas"]["AlbumInteractionEntity"],
  "type"
> & { type: InteractionType.ALBUM };

/** A recent-engagement entry for an artist. */
export type ArtistInteraction = Omit<
  components["schemas"]["ArtistInteractionEntity"],
  "type"
> & { type: InteractionType.ARTIST };

/**
 * A recent-engagement entry for a playlist.
 *
 * @remarks
 * `playlistType` needs the same escape hatch as `type` — it distinguishes Liked
 * Songs from a hand-made playlist, which decides whether the artwork is the
 * heart mark or the usual album tiles.
 */
export type PlaylistInteraction = Omit<
  components["schemas"]["PlaylistInteractionEntity"],
  "type" | "playlistType"
> & { type: InteractionType.PLAYLIST; playlistType: PlaylistType };

/** One item in the interactions feed — an album, artist, or playlist engagement. */
export type Interaction =
  | AlbumInteraction
  | ArtistInteraction
  | PlaylistInteraction;
