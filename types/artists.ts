export interface Artist {
  id: string;
  name: string;
  albumCount: number;
  trackCount: number;
}

export interface ArtistMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ArtistItemsResponse {
  data: Artist[];
  meta: ArtistMetaDto;
}
