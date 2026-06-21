interface TrackArtist {
  id: string;
  name: string;
}

interface TrackAlbum {
  id: string;
  title: string;
}

export interface Track {
  id: string;
  title: string;
  releaseDate: Date;
  suffix: string;
  trackNumber: number;
  discNumber: number;
  genres: string[];
  duration: number;
  size: number;
  bitRate: number;
  sampleRate: number;
  bitDepth: number | null;
  album: TrackAlbum;
  artists: TrackArtist[];
}

export interface TrackSummary {
  id: string;
  title: string;
  releaseDate: Date;
  genres: string[];
  duration: number;
  album: TrackAlbum;
  artists: TrackArtist[];
  trackNumber: number;
}