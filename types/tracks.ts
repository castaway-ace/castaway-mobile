import type { components } from "@/api/schema";

/**
 * Track domain types, aliased from the generated backend schema.
 *
 * @remarks
 * App code imports these names instead of reaching into `schema.d.ts` directly,
 * so the generated file (regenerated via `bun run generate:types`) stays an
 * implementation detail and call sites read cleanly.
 */

/** A single track with full metadata (from the track detail endpoint). */
export type Track = components["schemas"]["TrackEntity"];
/** The lighter track shape returned in lists and stored in the play queue. */
export type TrackSummary = components["schemas"]["TrackSummaryEntity"];
