import { useMutation, useQueryClient } from "@tanstack/react-query";
import { interactionApi } from "../interactions";

export const useUpdateAlbumInteraction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            interactionApi.createOrUpdateAlbum(id);
        },
        onSuccess: (): void => {
            queryClient.invalidateQueries({ queryKey: ['interactions'] });
          },
    });
};

export const useUpdateArtistInteraction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            interactionApi.createOrUpdateArtist(id);
        },
        onSuccess: (): void => {
            queryClient.invalidateQueries({ queryKey: ['interactions'] });
          },
    });
};

export const useUpdatePlaylistInteraction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            interactionApi.createOrUpdatePlaylist(id);
        },
        onSuccess: (): void => {
            queryClient.invalidateQueries({ queryKey: ['interactions'] });
          },
    });
};
