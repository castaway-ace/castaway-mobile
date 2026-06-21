import { TrackSummary } from "./tracks";

export enum PlaylistType {
  USER = 'USER',
  LIKED = 'LIKED'
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  type: PlaylistType;
  albumCoverUrls: string[];
}

export interface PlaylistTrack extends TrackSummary {
  trackId: string;
}

export interface PlaylistSummary {
  id: string;
  name: string;
  type: PlaylistType;
  albumCoverUrls: string[];
}
