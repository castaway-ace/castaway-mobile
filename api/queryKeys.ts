type Filters = Record<string, unknown>;
type Id = string | undefined;

export const queryKeys = {
  tracks: {
    all: ["tracks"] as const,
    list: (filters: Filters) => ["tracks", filters] as const,
    detail: (id: Id) => ["track", id] as const,
  },
  albums: {
    all: ["albums"] as const,
    list: (filters: Filters) => ["albums", filters] as const,
    detail: (id: Id) => ["album", id] as const,
    cover: (id: Id) => ["albumCover", id] as const,
  },
  artists: {
    all: ["artists"] as const,
    list: (filters: Filters) => ["artists", filters] as const,
    detail: (id: Id) => ["artist", id] as const,
    image: (id: Id) => ["artistImage", id] as const,
  },
  playlists: {
    all: ["playlists"] as const,
    list: (filters: Filters) => ["playlists", filters] as const,
    detail: (id: Id) => ["playlist", id] as const,
    tracksAll: ["playlist-tracks"] as const,
    tracks: (playlistId: Id) => ["playlist-tracks", playlistId] as const,
    track: (playlistId: Id, trackId: Id) =>
      ["playlist-tracks", playlistId, trackId] as const,
  },
  search: (query: string) => ["search", query] as const,
  interactions: ["interactions"] as const,
};
