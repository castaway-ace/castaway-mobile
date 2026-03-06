import { baseUrl } from "@/api/client";

export const getAlbumCoverUrl = (albumId: string): string => {
  return `${baseUrl}/music/albums/${albumId}/cover`;
}

export const getArtistImage = (artistId: string): string => {
  return `${baseUrl}/music/artists/${artistId}/image`;
}