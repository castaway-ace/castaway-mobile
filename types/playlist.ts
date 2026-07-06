import type { components } from "@/schema";

export enum PlaylistType {
  USER = "USER",
  LIKED = "LIKED",
}

export type PlaylistRef = components["schemas"]["PlaylistRef"];

export type Playlist = Omit<components["schemas"]["PlaylistEntity"], "type"> & {
  type: PlaylistType;
};

export type PlaylistSummary = Omit<
  components["schemas"]["PlaylistSummaryEntity"],
  "type"
> & {
  type: PlaylistType;
};

export type PlaylistTrack = components["schemas"]["PlaylistTrackEntity"];
