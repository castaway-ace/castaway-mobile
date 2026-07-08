type Filters = Record<string, unknown>;
type Id = string | undefined;

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
};
