import { useToast } from "@/contexts/toastContext";
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
    playlistName?: string;
}

export const useCreatePlaylist = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    return useMutation({
        mutationFn: async (name: string) => {
            return playlistApi.create(name);
        },
        onSuccess: (): void => {
            showToast("Playlist created");
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
        },
    });
};

export const useUpdatePlaylist = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    return useMutation({
        mutationFn: async ({ id, body }: PlaylistUpdateMutation) => {
            await playlistApi.update(id, body);
        },
        onSuccess: (_data, { id }): void => {
            showToast("Playlist updated");
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.detail(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
        },
    });
};

export const useDeletePlaylist = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    return useMutation({
        mutationFn: async (id: string) => {
            await playlistApi.delete(id);
        },
        onSuccess: (_data, id): void => {
            showToast("Playlist deleted");
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.detail(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.interactions });
        },
    });
};

export const useAddTrackToPlaylist = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    return useMutation({
        mutationFn: async ({ playlistId, trackId }: PlaylistTrackMutation) => {
            await playlistApi.addTrack(playlistId, trackId);
        },
        onSuccess: (_data, { playlistId, playlistName }): void => {
            showToast(playlistName ? `Added to ${playlistName}` : "Added to playlist");
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.detail(playlistId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.tracks(playlistId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
        },
    });
};

export const useRemoveTrackFromPlaylist = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    return useMutation({
        mutationFn: async ({ playlistId, trackId }: PlaylistTrackMutation) => {
            await playlistApi.deleteTrack(playlistId, trackId);
        },
        onSuccess: (_data, { playlistId }): void => {
            showToast("Removed from playlist");
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.detail(playlistId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.tracks(playlistId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
        },
    });
};
