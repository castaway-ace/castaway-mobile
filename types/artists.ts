import type { components } from "@/api/schema";

/** Artist domain types, aliased from the generated backend schema (see {@link Track}). */

/** A single artist with their discography. */
export type Artist = components["schemas"]["ArtistEntity"];
/** The lighter artist shape returned in lists. */
export type ArtistSummary = components["schemas"]["ArtistSummaryEntity"];
