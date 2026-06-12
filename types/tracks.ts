export interface Track {
  id: string;
  title: string;
  releaseDate: Date;
  suffix: string;
  trackNumber: string;
  discNumber: string;
  genres: string[];
  duration: number;
  size: number;
  bitRate: number;
  sampleRate: number;
  bitDepth: number | null;
  albumName: string;
  artistNames: string[];
  albumId: string;
  starred: boolean;
}

export interface TrackSummary {
  id: string;
  title: string;
  releaseDate: Date;
  genres: string[];
  duration: number;
  albumName: string;
  artistNames: string[];
  albumId: string;
}