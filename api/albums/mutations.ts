import { queryKeys } from "../queryKeys";
import { useStarMutation } from "../starMutation";
import { albumApi } from "./api";

export const useAlbumStar = () =>
  useStarMutation({
    star: albumApi.star,
    unStar: albumApi.unStar,
    messages: {
      added: "Added to Your Library",
      removed: "Removed from Your Library",
    },
    invalidateKeys: (id) => [queryKeys.albums.detail(id), queryKeys.albums.all],
  });
