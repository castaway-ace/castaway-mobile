export interface Interaction {
    id: string;
    userId: string;
    albumId?: string;
    playlistId?: string;
    artistId?: string;
    updatedAt: Date;
  };