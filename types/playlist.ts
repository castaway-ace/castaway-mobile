interface PlaylistTrackArtist {
  id: string;
  name: string;
}

export enum PlaylistType {
  USER = 'USER',
  LIKED = 'LIKED'
}

export interface PlaylistTrack {
  id: string;
  trackId: string;
  title: string;
  artists: PlaylistTrackArtist[];
}

export interface Playlist {
    id: string;
    name: string;
    description: string;
    type: PlaylistType;
    tracks: PlaylistTrack[];
  }
  