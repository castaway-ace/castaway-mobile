import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trackApi } from "../tracks";

interface TrackStarMutation {
    id: string;
    starred: boolean;
}

export const useTrackStar = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({id, starred}: TrackStarMutation) => {
            if (starred) {
                console.log(starred);
                await trackApi.unStar(id);
            }
            else {
                console.log(starred);
                await trackApi.star(id);
            }
        },
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['track', id] });
            queryClient.invalidateQueries({ queryKey: ['tracks'] });
        },
    });
};