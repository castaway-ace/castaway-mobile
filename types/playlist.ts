export enum PlaylistType {
  USER = 'USER',
  LIKED = 'LIKED'
}

interface PlaylistTrackArtist {
  id: string;
  name: string;
}

interface PlaylistTrackAlbum {
  id: string;
  title: string;
}

export interface PlaylistTrack {
  id: string;
  trackId: string;
  title: string;
  artists: PlaylistTrackArtist[];
  album: PlaylistTrackAlbum;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  type: PlaylistType;
  albumCoverUrls: string[];
}

export interface PlaylistSummary {
  id: string;
  name: string;
  type: PlaylistType;
  albumCoverUrls: string[];
}
