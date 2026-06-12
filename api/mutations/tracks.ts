import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trackApi } from "../tracks";

interface TrackStarMutation {
    id: string;
    starred: boolean;
}

export const useTrackStar = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, starred }: TrackStarMutation) => {
            if (starred) {
                await trackApi.unStar(id);
            }
            else {
                await trackApi.star(id);
            }
        },
        onMutate: async ({ id, starred }) => {
            await queryClient.cancelQueries({ queryKey: ['starred-tracks'] });
            const previous = queryClient.getQueryData<string[]>(['starred-tracks']);

            queryClient.setQueryData<string[]>(['starred-tracks'], (old = []) => {
                if (starred) {
                    return old.filter((trackId) => trackId !== id);
                }
                return old.includes(id) ? old : [...old, id];
            });

            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
              queryClient.setQueryData(['starred-tracks'], context.previous);
            }
          },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['starred-tracks'] });
        },
    });
};