import { useToast } from "@/contexts/toastContext";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";

interface StarVariables {
  id: string;
  /** The entity's *current* starred state; the mutation flips it. */
  starred: boolean;
}

/** Per-entity wiring that adapts the generic star flow to tracks, albums, or artists. */
interface StarMutationConfig {
  star: (id: string) => Promise<void>;
  unStar: (id: string) => Promise<void>;
  /** Toast copy for each direction (e.g. "Added to Liked Songs" / "Removed …"). */
  messages: { added: string; removed: string };
  /** Detail cache key optimistically patched and rolled back. */
  detailKey: (id: string) => QueryKey;
  /** Every key to invalidate once settled — detail plus any list/derived views. */
  invalidateKeys: (id: string) => QueryKey[];
}

/** Snapshot passed from `onMutate` to `onError` so a failed toggle can be undone. */
interface StarContext {
  detailKey: QueryKey;
  previous: { starred: boolean } | undefined;
}

/**
 * Factory for the "star / unstar" toggle mutation shared by tracks, albums, and
 * artists.
 *
 * @remarks
 * Starring is a one-tap action where users expect the icon to fill instantly,
 * so the update is applied optimistically and reconciled with the server after
 * the fact:
 *
 * 1. `onMutate` cancels in-flight detail fetches (so a slow response can't land
 *    on top of our optimistic value), snapshots the current state, and flips the
 *    cached `starred` flag immediately.
 * 2. `onError` restores that snapshot and surfaces a toast — the tap is undone
 *    and the UI never gets stuck in a wrong state.
 * 3. `onSettled` invalidates the configured keys regardless of outcome, so the
 *    optimistic value is replaced by authoritative server data.
 *
 * The three entity types differ only in their {@link StarMutationConfig}, which
 * keeps this cache choreography in exactly one place.
 */
export const useStarMutation = ({
  star,
  unStar,
  messages,
  detailKey,
  invalidateKeys,
}: StarMutationConfig) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async ({ id, starred }: StarVariables) => {
      if (starred) {
        await unStar(id);
      } else {
        await star(id);
      }
    },
    onMutate: async ({ id, starred }): Promise<StarContext> => {
      const key = detailKey(id);
      // Cancel outstanding fetches for this entity so an older in-flight
      // response can't clobber the optimistic value we're about to write.
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<{ starred: boolean }>(key);
      queryClient.setQueryData<{ starred: boolean }>(key, (old) =>
        old ? { ...old, starred: !starred } : old,
      );
      // Handed to onError as the rollback point.
      return { detailKey: key, previous };
    },
    onError: (_error, _variables, context) => {
      // Roll back to the pre-tap snapshot. Guard on `undefined` because the
      // entity may not have been cached when the mutation started.
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.detailKey, context.previous);
      }
      showToast("Something went wrong. Please try again.");
    },
    onSuccess: (_data, { starred }) => {
      // `starred` is the pre-toggle state, so the messages read inverted.
      showToast(starred ? messages.removed : messages.added);
    },
    onSettled: (_data, _error, { id }) => {
      // Refetch on both success and failure so the cache ends up authoritative
      // rather than trusting the optimistic write.
      for (const key of invalidateKeys(id)) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
};
