import type { components } from "@/api/schema";

/** Raw search response: matched tracks, albums, and artists in separate groups. Flattened for display by `useOrganizedSearch`. */
export type Search = components["schemas"]["SearchResultsEntity"];
