import { queryKeys } from "../queryKeys";
import { useStarMutation } from "../starMutation";
import { trackApi } from "./api";

export const useTrackStar = () =>
  useStarMutation({
    star: trackApi.star,
    unStar: trackApi.unStar,
    messages: {
      added: "Added to Liked Songs",
      removed: "Removed from Liked Songs",
    },
    detailKey: (id) => queryKeys.tracks.detail(id),
    invalidateKeys: (id) => [
      queryKeys.tracks.detail(id),
      queryKeys.tracks.all,
      queryKeys.playlists.all,
      queryKeys.interactions,
    ],
  });
