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

export const useArtist = (id: string) => {
    return useQuery({
        queryKey: ['playlist', id],
        queryFn: () => playlistApi.getById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
};