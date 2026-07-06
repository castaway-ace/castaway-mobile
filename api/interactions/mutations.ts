import { useMutation, useQueryClient } from "@tanstack/react-query";
import { interactionApi } from "./api";

export const useUpdateAlbumInteraction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            await interactionApi.createOrUpdateAlbum(id);
        },
        onSuccess: (): void => {
            queryClient.invalidateQueries({ queryKey: ['interactions'] });
          },
    });
};

export const useUpdateArtistInteraction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            await interactionApi.createOrUpdateArtist(id);
        },
        onSuccess: (): void => {
            queryClient.invalidateQueries({ queryKey: ['interactions'] });
          },
    });
};

export const useUpdatePlaylistInteraction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            await interactionApi.createOrUpdatePlaylist(id);
        },
        onSuccess: (): void => {
            queryClient.invalidateQueries({ queryKey: ['interactions'] });
          },
    });
};
