export enum InteractionType {
  ALBUM = 'album',
  ARTIST = 'artist',
  PLAYLIST = 'playlist',
}

interface Artist {
  name: string;
  id: string;
}

interface Album {
  title: string;
  id: string;
}

interface Playlist {
  name: string;
  id: string;
}

interface AlbumInteraction {
  id: string;
  userId: string;
  updatedAt: Date;
  type: InteractionType.ALBUM;
  album: Album;
  coverUrl: string;
  artists: Artist[]
};

interface ArtistInteraction {
  id: string;
  userId: string;
  updatedAt: Date;
  artist: Artist;
  coverUrl: string;
  type: InteractionType.ARTIST;
};

interface PlaylistInteraction {
  id: string;
  userId: string;
  updatedAt: Date;
  playlist: Playlist;
  coverUrls: string[];
  type: InteractionType.PLAYLIST;
};

export type Interaction = 
  | AlbumInteraction 
  | ArtistInteraction 
  | PlaylistInteraction;