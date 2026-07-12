import type { components } from "@/api/schema";

/** Album domain types, aliased from the generated backend schema (see {@link Track}). */

/** A track as it appears within an album (carries its track number). */
export type AlbumTrack = components["schemas"]["AlbumTrackEntity"];

/** A single album with its full track listing. */
export type Album = components["schemas"]["AlbumEntity"];
/** The lighter album shape returned in lists. */
export type AlbumSummary = components["schemas"]["AlbumSummaryEntity"];
