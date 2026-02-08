export interface Artist {
    id: string;
    name: string;
  }

export interface TrackArtist {
artist: Artist;
order: number;
}