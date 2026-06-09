import { albumCoverQueryOptions } from "@/api/queries/albums";
import { artistImageQueryOptions } from "@/api/queries/artists";
import { Search } from "@/types/search";
import { useQueries } from "@tanstack/react-query";

export interface SearchItemElements {
    imageUrl: string | undefined;
    text: string;
    subText?: string;
}

export const useOrganizedSearch = (search: Search | undefined): SearchItemElements[] => {
    const albums = search?.albums ?? [];
    const artists = search?.artists ?? [];
    const tracks = search?.tracks ?? [];
  
    const albumCovers = useQueries({
      queries: albums.map((album) => albumCoverQueryOptions(album.id)),
    });
    const artistImages = useQueries({
      queries: artists.map((artist) => artistImageQueryOptions(artist.id)),
    });
    const trackCovers = useQueries({
      queries: tracks.map((track) => albumCoverQueryOptions(track.albumId)),
    });
  
    return [
      ...albums.map((album, i) => ({
        imageUrl: albumCovers[i]?.data,
        text: album.title,
        subText: `Album • ${album.artists.join(", ")}`,
      })),
      ...artists.map((artist, i) => ({
        imageUrl: artistImages[i]?.data,
        text: artist.name,
        subText: "Artist",
      })),
      ...tracks.map((track, i) => ({
        imageUrl: trackCovers[i]?.data,
        text: track.title,
        subText: `Track • ${track.artistNames.join(", ")}`,
      })),
    ];
  };