import { useMutation, useQueryClient } from "@tanstack/react-query";
import { playlistApi } from "../playlist";

interface PlaylistUpdateMutation {
    id: string;
    body: {
        name: string;
    }
}

interface PlaylistDeleteMutation {
    id: string;
}

interface PlaylistTrackMutation {
    playlistId: string;
    trackId: string;
}

export const useUpdatePlaylist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, body }: PlaylistUpdateMutation) => {
            await playlistApi.update(id, body);
        },
        onSuccess: (_data, { id }): void => {
            queryClient.invalidateQueries({ queryKey: ['playlist', id] });
          },
    });
};

export const useDeletePlaylist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id }: PlaylistDeleteMutation) => {
            await playlistApi.delete(id);
        },
        onSuccess: (_data, { id }): void => {
            queryClient.invalidateQueries({ queryKey: ['playlist', id] });
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
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
            queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
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
            queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
          },
    });
};