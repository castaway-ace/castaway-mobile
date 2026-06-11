import { albumCoverQueryOptions } from "@/api/queries/albums";
import { artistImageQueryOptions } from "@/api/queries/artists";
import { Search } from "@/types/search";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

export interface SearchItemElements {
  imageUrl: string | undefined;
  text: string;
  subText?: string;
}

export const useOrganizedSearch = (search: Search | undefined): SearchItemElements[] => {
  const albums = useMemo(() => search?.albums ?? [], [search]);
  const artists = useMemo(() => search?.artists ?? [], [search]);
  const tracks = useMemo(() => search?.tracks ?? [], [search]);

  const albumIds = useMemo(() => {
    const ids = new Set<string>();
    albums.forEach((a) => a.id && ids.add(a.id));
    tracks.forEach((t) => t.albumId && ids.add(t.albumId));
    return [...ids];
  }, [albums, tracks]);

  const albumCoverResults = useQueries({
    queries: albumIds.map((id) => albumCoverQueryOptions(id)),
  });

  const coverById = useMemo(() => {
    const map = new Map<string, string | undefined>();
    albumIds.forEach((id, i) => map.set(id, albumCoverResults[i]?.data));
    return map;
  }, [albumIds, albumCoverResults]);

  const artistImages = useQueries({
    queries: artists.map((artist) => artistImageQueryOptions(artist.id)),
  });

  return [
    ...albums.map((album, i) => ({
      imageUrl: coverById.get(album.id),
      text: album.title,
      subText: `Album • ${album.artists.join(", ")}`,
    })),
    ...artists.map((artist, i) => ({
      imageUrl: artistImages[i]?.data,
      text: artist.name,
      subText: "Artist",
    })),
    ...tracks.map((track, i) => ({
      imageUrl: coverById.get(track.albumId),
      text: track.title,
      subText: `Track • ${track.artistNames.join(", ")}`,
    })),
  ];
};