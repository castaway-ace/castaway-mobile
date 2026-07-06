import { OrderBy } from "@/constants/api";
import { GC_TIME, STALE_TIME } from "@/constants/query";
import { skipToken, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { playlistApi, PlaylistOrder } from "./api";

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

export const usePlaylist = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.playlists.detail(id),
    queryFn: id ? () => playlistApi.getOne(id) : skipToken,
    staleTime: STALE_TIME.LONG,
  });
};

export const usePlaylistTracks = (playlistId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.playlists.tracks(playlistId),
    queryFn: playlistId ? () => playlistApi.getAllTracks(playlistId) : skipToken,
  });
}

export const usePlaylistTrack = (playlistId: string | undefined, trackId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.playlists.track(playlistId, trackId),
    queryFn: playlistId && trackId ? () => playlistApi.getTrack(playlistId, trackId) : skipToken,
  });
}
