import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { albumApi } from "./api";

interface AlbumStarMutation {
    id: string;
    starred: boolean;
}

export const useAlbumStar = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({id, starred}: AlbumStarMutation) => {
            if (starred) {
                await albumApi.unStar(id);
            }
            else {
                await albumApi.star(id);
            }
        },
        onSuccess: (_data, { id, starred }) => {
            Toast.show({
                type: 'success',
                text1: starred ? 'Removed from Your Library' : 'Added to Your Library',
              });
            queryClient.invalidateQueries({ queryKey: ['album', id] });
            queryClient.invalidateQueries({ queryKey: ['albums'] });
        },
    });
};
