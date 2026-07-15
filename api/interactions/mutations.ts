import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { interactionApi } from "./api";

/**
 * Shared factory for the "record an interaction" mutations.
 *
 * @remarks
 * All three entity types record identically — fire the request, then refresh the
 * recency-ordered views so they reflect the new engagement — so the behavior
 * lives here once and each export just binds the entity-specific endpoint.
 * Typically fired as a side effect of opening or playing an entity.
 *
 * Both the interactions feed and the library rank on this recency, and each is
 * ordered server-side, so both are invalidated: recording an interaction is
 * precisely what moves an item to the top of either list.
 */
const useInteractionMutation = (
  createOrUpdate: (id: string) => Promise<void>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
    },
  });
};

/** Records that the user engaged with an album. */
export const useUpdateAlbumInteraction = () =>
  useInteractionMutation(interactionApi.createOrUpdateAlbum);

/** Records that the user engaged with an artist. */
export const useUpdateArtistInteraction = () =>
  useInteractionMutation(interactionApi.createOrUpdateArtist);

/** Records that the user engaged with a playlist. */
export const useUpdatePlaylistInteraction = () =>
  useInteractionMutation(interactionApi.createOrUpdatePlaylist);
