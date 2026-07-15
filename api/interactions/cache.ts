import { queryKeys } from "@/api/queryKeys";
import { Interaction, InteractionType } from "@/types/interactions";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Primes a detail screen's artwork cache from the interactions feed.
 *
 * @remarks
 * The feed bundles a `coverUrl` per entry, but detail screens read artwork from
 * their own per-entity queries (`artists.image` / `albums.cover`). Without this,
 * tapping a Recently Played tile lands on a screen that has to fetch a URL the
 * feed already had, leaving the artwork empty for a round trip — unlike the
 * Favorite Artists shelf, whose {@link ArtistItem} populates that same cache just
 * by rendering.
 *
 * Seeded as fresh. The feed's URL isn't the same string the per-entity endpoint
 * returns — both presign the same bucket key, so the signature differs every call
 * — but it addresses the same object and stays valid for an hour, comfortably
 * longer than `STALE_TIME.LONG`. Paired with {@link presignedImageSource}, which
 * keys the image cache on the shared path, the feed's URL resolves to artwork the
 * tile already downloaded, so there's nothing to gain from refetching it.
 *
 * Playlists are skipped: their tiles come from the playlist detail payload, so
 * there's no separate artwork cache to prime.
 */
export const useSeedInteractionArtwork = () => {
  const queryClient = useQueryClient();

  return (interaction: Interaction) => {
    if (interaction.type === InteractionType.ARTIST) {
      if (!interaction.coverUrl) return;
      queryClient.setQueryData(
        queryKeys.artists.image(interaction.artist.id),
        interaction.coverUrl,
      );
    } else if (interaction.type === InteractionType.ALBUM) {
      if (!interaction.coverUrl) return;
      queryClient.setQueryData(
        queryKeys.albums.cover(interaction.album.id),
        interaction.coverUrl,
      );
    }
  };
};
