import { queryKeys } from "../queryKeys";
import { useStarMutation } from "../starMutation";
import { trackApi } from "./api";

/**
 * Star/unstar toggle for tracks — i.e. adding to or removing from Liked Songs.
 *
 * @remarks
 * Invalidates more than the track itself: liking a track changes the Liked Songs
 * playlist (and thus its generated cover art), which is surfaced through both the
 * playlist and interactions caches. So `playlists.all` and `interactions` are
 * refreshed alongside the track detail and lists — otherwise the Liked Songs
 * cover would lag behind the like.
 */
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
