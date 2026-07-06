import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { interactionApi } from "./api";

const useInteractionMutation = (
  createOrUpdate: (id: string) => Promise<void>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interactions });
    },
  });
};

export const useUpdateAlbumInteraction = () =>
  useInteractionMutation(interactionApi.createOrUpdateAlbum);

export const useUpdateArtistInteraction = () =>
  useInteractionMutation(interactionApi.createOrUpdateArtist);

export const useUpdatePlaylistInteraction = () =>
  useInteractionMutation(interactionApi.createOrUpdatePlaylist);
