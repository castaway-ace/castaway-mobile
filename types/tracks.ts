import { Album } from "./albums";
import { TrackArtist } from "./artists";
import { AudioFile } from "./audioFile";

export interface TrackArtistDto {
  id: string;
  name: string;
}

export interface TrackAlbumDto {
  id: string;
  title: string;
  coverUrl: string | null;
}

export interface TrackItemDto {
  id: string;
  title: string;
  duration: number;
  album: TrackAlbumDto;
  artists: TrackArtistDto[];
}

export interface TrackItemsResponseDto {
  data: TrackItemDto[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface Track {
  id: string;
  title: string;
  duration: number | null;
  artists: TrackArtist[]; 
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