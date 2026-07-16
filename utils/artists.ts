import type { ArtistRef } from "@/types/artists";

/**
 * Whether an artist is the synthetic "Various Artists" credit.
 *
 * @remarks
 * That entity backs compilation albums with many contributors. It is
 * information only: it must never be navigable to as an artist page and must
 * never record an interaction, so every artist-tap surface gates its affordance
 * on this, and every browsable artist list filters it out. Accepts any artist
 * shape (ref, summary, or full) since all carry the flag; a missing value reads
 * as a normal artist.
 */
export const isVariousArtists = (
  artist: ArtistRef | null | undefined,
): boolean => !!artist?.isVarious;
