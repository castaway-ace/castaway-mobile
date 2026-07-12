import { queryKeys } from "../queryKeys";
import { useStarMutation } from "../starMutation";
import { artistApi } from "./api";

/**
 * Star/unstar toggle for artists.
 *
 * @remarks
 * Supplies the artist-specific config to {@link useStarMutation}, invalidating
 * the artist detail and the artist lists after settling. Mirrors
 * {@link useAlbumStar}.
 */
export const useArtistStar = () =>
  useStarMutation({
    star: artistApi.star,
    unStar: artistApi.unStar,
    messages: {
      added: "Added to Your Library",
      removed: "Removed from Your Library",
    },
    detailKey: (id) => queryKeys.artists.detail(id),
    invalidateKeys: (id) => [
      queryKeys.artists.detail(id),
      queryKeys.artists.all,
    ],
  });
