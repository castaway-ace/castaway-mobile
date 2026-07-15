import { useToast } from "@/contexts/toastContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { playlistApi } from "./api";

/**
 * Write hooks for playlists. Each wraps a {@link playlistApi} call, surfaces a
 * toast on success, and invalidates the caches its change affects.
 *
 * @remarks
 * Every hook here also invalidates {@link queryKeys.interactions} and
 * {@link queryKeys.library} alongside the playlist keys. A playlist surfaces
 * through all three caches, and its cover art is derived independently in each,
 * so touching a playlist's contents can change a cover rendered from any of
 * them; invalidating only the playlist keys would leave a stale grid behind.
 * Creating, renaming, or deleting likewise adds, relabels, or removes a library
 * row, which the library query resolves server-side and cannot infer from the
 * playlist keys.
 *
 * @packageDocumentation
 */

interface PlaylistUpdateMutation {
    id: string;
    body: {
        name: string;
    }
}

interface PlaylistTrackMutation {
    playlistId: string;
    trackId: string;
    /** Optional display name, used only to make the success toast specific. */
    playlistName?: string;
}

/** Creates a playlist, then refreshes the playlist list so it appears immediately. */
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
            queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
        },
    });
};

/** Renames a playlist, invalidating its detail plus the lists that show its name. */
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
            queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
        },
    });
};

/**
 * Deletes a playlist and clears every cache that referenced it — its detail, the
 * list, interactions, and the library (either of which may have surfaced it).
 */
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
            queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
        },
    });
};

/**
 * Adds a track to a playlist and refreshes the playlist's detail, its track
 * list, the playlist index, interactions, and the library (see the module note
 * on why cover art forces those last two).
 */
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
            queryClient.invalidateQueries({ queryKey: queryKeys.interactions });
            queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
        },
    });
};

/** Removes a track from a playlist, invalidating the same caches as {@link useAddTrackToPlaylist}. */
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
            queryClient.invalidateQueries({ queryKey: queryKeys.interactions });
            queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
        },
    });
};
