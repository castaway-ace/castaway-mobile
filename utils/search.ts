import { albumCoverQueryOptions } from "@/api/queries/albums";
import { artistImageQueryOptions } from "@/api/queries/artists";
import { Search } from "@/types/search";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

export enum SearchItemType {
  TRACK = 'track',
  ALBUM = 'album',
  ARTIST = 'artist',
}

export interface SearchItemElements {
  id: string
  imageUrl: string | undefined;
  text: string;
  subText?: string;
  type: SearchItemType;
  albumId?: string;
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
    ...albums.map((album) => ({
      id: album.id,
      imageUrl: coverById.get(album.id),
      text: album.title,
      subText: `Album • ${album.artists.join(", ")}`,
      type: SearchItemType.ALBUM,
    })),
    ...artists.map((artist, i) => ({
      id: artist.id,
      imageUrl: artistImages[i]?.data,
      text: artist.name,
      subText: "Artist",
      type: SearchItemType.ARTIST,
    })),
    ...tracks.map((track) => ({
      id: track.id,
      imageUrl: coverById.get(track.albumId),
      text: track.title,
      subText: `Track • ${track.artistNames.join(", ")}`,
      albumId: track.albumId,
      type: SearchItemType.TRACK,
    })),
  ];
};