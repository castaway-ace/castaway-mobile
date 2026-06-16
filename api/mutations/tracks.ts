import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
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
        onSuccess: (_data, { starred }) => {
            Toast.show({
                type: 'success',
                text1: starred ? 'Removed from Liked Songs' : 'Added to Liked Songs',
              });
              queryClient.invalidateQueries({ queryKey: ['starred-tracks'] });
          },
    });
};