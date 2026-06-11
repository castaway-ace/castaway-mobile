import { useMutation, useQueryClient } from "@tanstack/react-query";
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
                console.log(starred, id);
                await artistApi.unStar(id);
            }
            else {
                console.log(starred, id);
                await artistApi.star(id);
            }
        },
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['artist', id] });
        },
    });
};
