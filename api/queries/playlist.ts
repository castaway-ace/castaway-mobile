import { OrderBy } from "@/constants/api";
import { skipToken, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { playlistApi, PlaylistOrder } from "../playlist";

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
    queryKey: ['tracks', { limit, order, orderBy, onlyUser }],
    queryFn: ({ pageParam }) => playlistApi.getAll({ limit, offset: pageParam, orderBy, order, onlyUser }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) {
        return undefined;
      }
      return allPages.length * limit;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    initialPageParam: 0,
  });
}

export const usePlaylist = (id: string | undefined) => {
  return useQuery({
    queryKey: ['playlist', id],
    queryFn: id ? () => playlistApi.getOne(id) : skipToken,
    staleTime: 10 * 60 * 1000,
  });
};

export const usePlaylistTracks = (playlistId: string) => {
  return useQuery({
    queryKey: ['playlist-tracks', playlistId],
    queryFn: () => playlistApi.getAllTracks(playlistId),
    enabled: !!playlistId,
  });
}

export const usePlaylistTrack = (playlistId: string, trackId: string) => {
  return useQuery({
    queryKey: ['playlist-tracks', playlistId, trackId],
    queryFn: () => playlistApi.getTrack(playlistId, trackId),
    enabled: !!playlistId && !!trackId,
  });
}