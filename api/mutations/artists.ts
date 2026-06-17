import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { artistApi } from "../artists";

interface ArtistStarMutation {
    id: string;
    starred: boolean;
}

export const useArtistStar = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({id, starred}: ArtistStarMutation) => {
            if (starred) {
                await artistApi.unStar(id);
            }
            else {
                await artistApi.star(id);
            }
        },
        onSuccess: (_data, { id, starred }) => {
            Toast.show({
                type: 'success',
                text1: starred ? 'Removed from Your Library' : 'Added to Your Library',
              });
            queryClient.invalidateQueries({ queryKey: ['artist', id] });
            queryClient.invalidateQueries({ queryKey: ['artists'] });
        },
    });
};
