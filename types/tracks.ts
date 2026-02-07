import { Album } from "./albums";
import { Artist } from "./artists";
import { AudioFile } from "./audioFile";

export interface ListTrackItem {
  id: string;
  title: string;
  duration: number;
  artists: Artist[];
  album: Album;
  albumUrl: string;
}

export interface Track {
  id: string;
  title: string;
  duration: number | null;
  artists: Artist[];
  album: Album;
  audioFile: AudioFile;
  albumUrl: string;
  trackUrl: string;
}

export interface StreamItem {
  url: string
  expiresIn: number
}

export interface TrackWithMedia extends Track {
  albumArt: StreamItem;
  stream: StreamItem;
}

export interface TrackItemsResponse {
  statusCode: number;
  data: ListTrackItem[];
}