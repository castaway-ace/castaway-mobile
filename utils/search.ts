import { albumCoverQueryOptions } from "@/api/albums/queries";
import { artistImageQueryOptions } from "@/api/artists/queries";
import { Search } from "@/types/search";
import { isVariousArtists } from "@/utils/artists";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

/** Discriminant for the {@link SearchItemElement} union. */
export enum SearchItemType {
  TRACK = 'track',
  ALBUM = 'album',
  ARTIST = 'artist',
}

/** Fields common to every search result row (id, artwork, and two lines of text). */
export interface SearchItem {
  id: string
  imageUrl: string | undefined;
  text: string;
  subText: string;
}

export interface AlbumSearchItem extends SearchItem {
  type: SearchItemType.ALBUM;
}

export interface ArtistSearchItem extends SearchItem {
  type: SearchItemType.ARTIST;
}

export interface TrackSearchItem extends SearchItem {
  type: SearchItemType.TRACK;
  albumId: string;
}

export type SearchItemElement = AlbumSearchItem | ArtistSearchItem | TrackSearchItem;

/**
 * Flattens a raw search response into a single, render-ready list of typed rows
 * with their artwork resolved.
 *
 * @remarks
 * The API returns albums, artists, and tracks separately and without cover URLs,
 * so this hook fetches the artwork and merges everything into one list the search
 * screen can map over directly. Album cover ids are gathered from both albums and
 * the tracks' albums and de-duplicated into a Set, so a shared album is fetched
 * once; `coverById` then gives O(1) lookup when building each row.
 */
export const useOrganizedSearch = (search: Search | undefined): SearchItemElement[] => {
  const albums = useMemo(() => search?.albums ?? [], [search]);
  const artists = useMemo(
    () => (search?.artists ?? []).filter((a) => !isVariousArtists(a)),
    [search],
  );
  const tracks = useMemo(() => search?.tracks ?? [], [search]);

  // Every distinct album whose cover we need — from album hits and from the
  // albums behind track hits — deduped so each cover is fetched only once.
  const albumIds = useMemo(() => {
    const ids = new Set<string>();
    albums.forEach((a) => a.id && ids.add(a.id));
    tracks.forEach((t) => t.album.id && ids.add(t.album.id));
    return [...ids];
  }, [albums, tracks]);

  const albumCoverResults = useQueries({
    queries: albumIds.map((id) => albumCoverQueryOptions(id)),
  });

  // Index the parallel query results back by album id for lookups below. Results
  // align with `albumIds` by position.
  const coverById = useMemo(() => {
    const map = new Map<string, string | undefined>();
    albumIds.forEach((id, i) => map.set(id, albumCoverResults[i]?.data));
    return map;
  }, [albumIds, albumCoverResults]);

  const artistImages = useQueries({
    queries: artists.map((artist) => artistImageQueryOptions(artist.id)),
  });

  return [
    ...albums.map((album): AlbumSearchItem => ({
      id: album.id,
      imageUrl: coverById.get(album.id),
      text: album.title,
      subText: `Album • ${album.artists.map((artist) => artist.name).join(", ")}`,
      type: SearchItemType.ALBUM,
    })),
    ...artists.map((artist, i): ArtistSearchItem => ({
      id: artist.id,
      imageUrl: artistImages[i]?.data,
      text: artist.name,
      subText: "Artist",
      type: SearchItemType.ARTIST,
    })),
    ...tracks.map((track): TrackSearchItem => ({
      id: track.id,
      imageUrl: coverById.get(track.album.id),
      text: track.title,
      subText: `Track • ${track.artists?.map((artist) => artist.name)?.join(", ")}`,
      albumId: track.album.id,
      type: SearchItemType.TRACK,
    })),
  ];
};