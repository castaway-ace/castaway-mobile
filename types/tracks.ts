export interface TrackArtistDto {
  id: string;
  name: string;
}

export interface TrackAlbumDto {
  id: string;
  title: string;
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

export interface TrackDto {
  id: string;
  title: string;
  duration: number | null;
  trackNumber: number | null;
  discNumber: number | null;
  album: TrackAlbumDto;
  artists: TrackArtistDto[];
}