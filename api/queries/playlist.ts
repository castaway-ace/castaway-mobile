import { useQuery } from "@tanstack/react-query";
import { playlistApi } from "../playlist";

export const usePlaylists = () => {
    return useQuery({
        queryKey: ['playlists'],
        queryFn: () => playlistApi.getAll(),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

export const usePlaylist = (id: string) => {
    return useQuery({
        queryKey: ['playlist', id],
        queryFn: () => playlistApi.getOne(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
};

export const usePlaylistTracks = (id: string) => {
    return useQuery({
      queryKey: ['playlist-tracks', id],
      queryFn: () => playlistApi.getAllTracks(id),
      enabled: !!id,
    });
  }

  export const usePlaylistTrack = (playlistId: string, trackId: string) => {
    return useQuery({
      queryKey: ['playlist-tracks', playlistId, trackId],
      queryFn: () => playlistApi.getTrack(playlistId, trackId),
      enabled: !!playlistId && !!trackId,
    });
  }