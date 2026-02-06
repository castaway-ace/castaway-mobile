import { Album } from "./albums";
import { Artist } from "./artists";
import { AudioFile } from "./audioFile";

export interface ListTrackItem {
  id: string;
  title: string;
  duration: number;
  artistName: string;
  albumId: string;
  albumTitle: string;
}

export interface Track {
  id: string;
  title: string;
  trackNumber: number | null;
  discNumber: number | null;
  duration: number | null;
  artists: Artist[];
  album: Album;
  audioFile: AudioFile;
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