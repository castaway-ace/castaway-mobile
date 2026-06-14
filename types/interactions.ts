export enum InteractionType {
  ALBUM = 'album',
  ARTIST = 'artist',
  PLAYLIST = 'playlist',
}

interface AlbumArtistInteraction {
    name: string;
    id: string;
}

interface AlbumInteraction {
  id: string;
  userId: string;
  updatedAt: Date;
  type: InteractionType.ALBUM;
  albumId: string;
  title: string;
  artists: AlbumArtistInteraction[]
};

interface ArtistInteraction {
  id: string;
  userId: string;
  updatedAt: Date;
  artistId: string;
  type: InteractionType.ARTIST;
  name: string;
};

interface PlaylistInteraction {
  id: string;
  userId: string;
  updatedAt: Date;
  playlistId: string;
  name: string;
  type: InteractionType.PLAYLIST;
};

export type Interaction = 
  | AlbumInteraction 
  | ArtistInteraction 
  | PlaylistInteraction;