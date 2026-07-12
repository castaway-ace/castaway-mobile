import { OrderBy } from "@/constants/api";
import { GC_TIME, STALE_TIME } from "@/constants/query";
import {
  skipToken,
  useInfiniteQuery,
  useQueries,
  useQuery,
} from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { playlistApi, PlaylistOrder } from "./api";

/** Caller-tunable knobs for {@link usePlaylists}; any omitted field falls back to {@link DEFAULT_PLAYLIST_OPTIONS}. */
export interface PlaylistOptions {
  order: PlaylistOrder
  orderBy: OrderBy,
  limit: number,
  onlyUser: boolean;
}

const DEFAULT_PLAYLIST_OPTIONS: PlaylistOptions = {
  limit: 100,
  order: PlaylistOrder.NAME,
  orderBy: OrderBy.ASC,
  onlyUser: false,
};

/**
 * Infinite, paginated list of playlists for the library and search views.
 *
 * @remarks
 * Uses a `SHORT` stale time because the list changes as the user creates,
 * renames, or deletes playlists — it should re-fetch soon after focus rather
 * than serve a long-cached snapshot. The next page offset is derived from the
 * accumulated page count, and pagination stops once a page returns fewer than
 * `limit` rows.
 *
 * @param options - Partial overrides merged over {@link DEFAULT_PLAYLIST_OPTIONS}.
 */
export const usePlaylists = (options: Partial<PlaylistOptions> = {}) => {
  const { limit, orderBy, order, onlyUser } = { ...DEFAULT_PLAYLIST_OPTIONS, ...options };
  return useInfiniteQuery({
    queryKey: queryKeys.playlists.list({ limit, order, orderBy, onlyUser }),
    queryFn: ({ pageParam }) => playlistApi.getAll({ limit, offset: pageParam, orderBy, order, onlyUser }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) {
        return undefined;
      }
      return allPages.length * limit;
    },
    staleTime: STALE_TIME.SHORT,
    gcTime: GC_TIME,
    initialPageParam: 0,
  });
}

/**
 * A single playlist's metadata by id.
 *
 * @remarks
 * `id` is optional so screens can call the hook unconditionally (respecting the
 * rules of hooks) before the route param resolves; when it is undefined the
 * query idles via `skipToken` instead of firing. `LONG` stale time because a
 * playlist's own metadata rarely changes and mutations invalidate it explicitly.
 */
export const usePlaylist = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.playlists.detail(id),
    queryFn: id ? () => playlistApi.getOne(id) : skipToken,
    staleTime: STALE_TIME.LONG,
  });
};

/**
 * The ordered tracks of a playlist. Idles until `playlistId` is known.
 *
 * @see {@link usePlaylist} for the same optional-id / `skipToken` pattern.
 */
export const usePlaylistTracks = (playlistId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.playlists.tracks(playlistId),
    queryFn: playlistId ? () => playlistApi.getAllTracks(playlistId) : skipToken,
    staleTime: STALE_TIME.LONG,
  });
}

/** A single playlist entry; idles until both ids are known. */
export const usePlaylistTrack = (playlistId: string | undefined, trackId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.playlists.track(playlistId, trackId),
    queryFn: playlistId && trackId ? () => playlistApi.getTrack(playlistId, trackId) : skipToken,
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Resolves which of the given playlists already contain a track — powers the
 * checkmarks in the "add to playlist" sheet.
 *
 * @remarks
 * Runs one query per playlist via `useQueries` (reusing the same cache entries
 * as {@link usePlaylistTracks}, so already-open playlists cost nothing) and
 * folds the results into a `Set` of matching playlist ids in `combine`. This
 * keeps the membership check reactive: as any playlist's tracks refetch, the
 * set recomputes automatically.
 *
 * @returns Set of playlist ids that contain `trackId`; empty while `trackId` is
 * undefined.
 */
export const usePlaylistsContainingTrack = (
  playlistIds: string[],
  trackId: string | undefined,
): Set<string> => {
  return useQueries({
    queries: playlistIds.map((playlistId) => ({
      queryKey: queryKeys.playlists.tracks(playlistId),
      queryFn: () => playlistApi.getAllTracks(playlistId),
      staleTime: STALE_TIME.LONG,
      gcTime: GC_TIME,
    })),
    combine: (results) => {
      const containing = new Set<string>();
      if (!trackId) return containing;
      results.forEach((result, index) => {
        if (result.data?.some((track) => track.trackId === trackId)) {
          containing.add(playlistIds[index]);
        }
      });
      return containing;
    },
  });
};
