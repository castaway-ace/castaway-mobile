import type { components } from "@/schema";

export enum InteractionType {
  ALBUM = "album",
  ARTIST = "artist",
  PLAYLIST = "playlist",
}

export type AlbumInteraction = Omit<
  components["schemas"]["AlbumInteractionEntity"],
  "type"
> & { type: InteractionType.ALBUM };

export type ArtistInteraction = Omit<
  components["schemas"]["ArtistInteractionEntity"],
  "type"
> & { type: InteractionType.ARTIST };

export type PlaylistInteraction = Omit<
  components["schemas"]["PlaylistInteractionEntity"],
  "type"
> & { type: InteractionType.PLAYLIST };

export type Interaction =
  | AlbumInteraction
  | ArtistInteraction
  | PlaylistInteraction;
