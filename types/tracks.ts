export interface Track {
  id: string;
  title: string;
  releaseDate: Date;
  genres: string[];
  duration: number;
  album: string;
  artists: string[];
  albumId: string;
}