import { queryKeys } from "../queryKeys";
import { useStarMutation } from "../starMutation";
import { albumApi } from "./api";

/**
 * Star/unstar toggle for albums.
 *
 * @remarks
 * Delegates the optimistic-update choreography to {@link useStarMutation}; this
 * only supplies the album-specific endpoints, toast copy, and the keys to
 * refresh — the album's own detail plus the album lists that show the star.
 */
export const useAlbumStar = () =>
  useStarMutation({
    star: albumApi.star,
    unStar: albumApi.unStar,
    messages: {
      added: "Added to Your Library",
      removed: "Removed from Your Library",
    },
    detailKey: (id) => queryKeys.albums.detail(id),
    invalidateKeys: (id) => [queryKeys.albums.detail(id), queryKeys.albums.all],
  });
