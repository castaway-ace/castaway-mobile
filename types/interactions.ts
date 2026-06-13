export enum InteractionType {
  ALBUM = 'album',
  ARTIST = 'artist',
  PLAYLIST = 'playlist',
}

interface AlbumInteraction {
  id: string;
  userId: string;
  updatedAt: Date;
  type: InteractionType.ALBUM;
  albumId: string;
  album: {
    title: string;
    albumArtists: string;
  };
};

interface ArtistInteraction {
  id: string;
  userId: string;
  updatedAt: Date;
  artistId: string;
  type: InteractionType.ARTIST;
  artist: {
    name: string;
  };
};

interface PlaylistInteraction {
  id: string;
  userId: string;
  updatedAt: Date;
  playlistId: string;
  playlist: {
    name: string;
  }
  type: InteractionType.PLAYLIST;
};

export type Interaction = 
  | AlbumInteraction 
  | ArtistInteraction 
  | PlaylistInteraction;