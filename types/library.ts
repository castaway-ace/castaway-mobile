import type { components } from "@/api/schema";

/**
 * Tags which entity a library item refers to; the discriminant for the
 * {@link LibraryItem} union.
 *
 * @remarks
 * Same escape hatch as {@link InteractionType}: the generated `type` field is a
 * bare string, so each item type below `Omit`s it and re-adds a specific enum
 * member, turning {@link LibraryItem} into a proper discriminated union.
 */
export enum LibraryItemType {
  ALBUM = "album",
  ARTIST = "artist",
  PLAYLIST = "playlist",
}

/** A favorited album in the library. */
export type AlbumLibraryItem = Omit<
  components["schemas"]["AlbumLibraryItemEntity"],
  "type"
> & { type: LibraryItemType.ALBUM };

/** A favorited artist in the library. */
export type ArtistLibraryItem = Omit<
  components["schemas"]["ArtistLibraryItemEntity"],
  "type"
> & { type: LibraryItemType.ARTIST };

/** One of the user's playlists, Liked Songs included. */
export type PlaylistLibraryItem = Omit<
  components["schemas"]["PlaylistLibraryItemEntity"],
  "type"
> & { type: LibraryItemType.PLAYLIST };

/**
 * One entry in the library — an album, artist, or playlist.
 *
 * @remarks
 * Carries `lastInteractedAt` (null when never opened) purely as provenance for
 * the order the server already applied; nothing client-side needs to re-sort on
 * it.
 */
export type LibraryItem =
  | AlbumLibraryItem
  | ArtistLibraryItem
  | PlaylistLibraryItem;
