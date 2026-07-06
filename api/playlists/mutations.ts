import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { playlistApi } from "./api";

interface PlaylistUpdateMutation {
    id: string;
    body: {
        name: string;
    }
}

interface PlaylistTrackMutation {
    playlistId: string;
    trackId: string;
}

export const useCreatePlaylist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (name: string) => {
            return playlistApi.create(name);
        },
        onSuccess: (): void => {
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
        },
    });
};

export const useUpdatePlaylist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, body }: PlaylistUpdateMutation) => {
            await playlistApi.update(id, body);
        },
        onSuccess: (_data, { id }): void => {
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.detail(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
        },
    });
};

export const useDeletePlaylist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await playlistApi.delete(id);
        },
        onSuccess: (_data, id): void => {
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.detail(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.interactions });
        },
    });
};

export const useAddTrackToPlaylist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ playlistId, trackId }: PlaylistTrackMutation) => {
            await playlistApi.addTrack(playlistId, trackId);
        },
        onSuccess: (_data, { playlistId }): void => {
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.detail(playlistId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.tracks(playlistId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
        },
    });
};

export const useRemoveTrackFromPlaylist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ playlistId, trackId }: PlaylistTrackMutation) => {
            await playlistApi.deleteTrack(playlistId, trackId);
        },
        onSuccess: (_data, { playlistId }): void => {
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.detail(playlistId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.tracks(playlistId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
        },
    });
};
