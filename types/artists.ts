import type { components } from "@/api/schema";

/** Artist domain types, aliased from the generated backend schema (see {@link Track}). */

/**
 * Minimal reference (id and name), as carried by a track's `artists`.
 *
 * @remarks
 * Carries `isVarious`: `true` on the synthetic "Various Artists" credit used for
 * compilation albums, which {@link isVariousArtists} gates on to keep it
 * display-only.
 */
export type ArtistRef = components["schemas"]["ArtistRef"];

/** A single artist with their discography. */
export type Artist = components["schemas"]["ArtistEntity"];
/** The lighter artist shape returned in lists. */
export type ArtistSummary = components["schemas"]["ArtistSummaryEntity"];
