type Filters = Record<string, unknown>;
type Id = string | undefined;

/**
 * Single source of truth for every React Query cache key.
 *
 * @remarks
 * Centralizing the keys keeps reads and their invalidations in agreement — a
 * mutation and the query it should refresh reference the exact same factory, so
 * they can never drift apart into a typo'd string. The keys are deliberately
 * hierarchical (e.g. `["playlists", "tracks", id]` nests under
 * `["playlists"]`): React Query matches by prefix, so invalidating a broad key
 * like `playlists.all` cascades to every list, detail, and track query beneath
 * it in one call. `as const` preserves the literal tuple types for that
 * matching.
 */
export const queryKeys = {
  tracks: {
    all: ["tracks"] as const,
    list: (filters: Filters) => ["tracks", "list", filters] as const,
    detail: (id: Id) => ["tracks", "detail", id] as const,
  },
  albums: {
    all: ["albums"] as const,
    list: (filters: Filters) => ["albums", "list", filters] as const,
    detail: (id: Id) => ["albums", "detail", id] as const,
    cover: (id: Id) => ["albums", "cover", id] as const,
  },
  artists: {
    all: ["artists"] as const,
    list: (filters: Filters) => ["artists", "list", filters] as const,
    detail: (id: Id) => ["artists", "detail", id] as const,
    image: (id: Id) => ["artists", "image", id] as const,
  },
  playlists: {
    all: ["playlists"] as const,
    list: (filters: Filters) => ["playlists", "list", filters] as const,
    detail: (id: Id) => ["playlists", "detail", id] as const,
    tracksAll: ["playlists", "tracks"] as const,
    tracks: (playlistId: Id) => ["playlists", "tracks", playlistId] as const,
    track: (playlistId: Id, trackId: Id) =>
      ["playlists", "tracks", playlistId, trackId] as const,
  },
  search: (query: string) => ["search", query] as const,
  interactions: ["interactions"] as const,
  library: {
    all: ["library"] as const,
    list: (filters: Filters) => ["library", "list", filters] as const,
  },
};
