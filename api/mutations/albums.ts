import { useMutation, useQueryClient } from "@tanstack/react-query";
import { albumApi } from "../albums";

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
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['album', id] });
        },
    });
};
