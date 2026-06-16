interface PlaylistTrackArtist {
  id: string;
  name: string;
}

export interface PlaylistTrack {
  id: string;
  title: string;
  artists: PlaylistTrackArtist[];
}

export interface Playlist {
    id: string;
    name: string;
    description: string;
    tracks: PlaylistTrack[];
  }
  