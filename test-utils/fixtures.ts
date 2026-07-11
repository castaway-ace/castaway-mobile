import type { components } from "@/api/schema";
import { Album, AlbumSummary, AlbumTrack } from "@/types/albums";
import { Artist, ArtistSummary } from "@/types/artists";
import {
  AlbumInteraction,
  ArtistInteraction,
  Interaction,
  InteractionType,
  PlaylistInteraction,
} from "@/types/interactions";
import {
  Playlist,
  PlaylistRef,
  PlaylistSummary,
  PlaylistTrack,
  PlaylistType,
} from "@/types/playlist";
import { Search } from "@/types/search";
import { Track, TrackSummary } from "@/types/tracks";

type AlbumRef = components["schemas"]["AlbumRef"];
type ArtistRef = components["schemas"]["ArtistRef"];

export const makeAlbumRef = (overrides: Partial<AlbumRef> = {}): AlbumRef => ({
  id: "album-1",
  title: "Test Album",
  ...overrides,
});

export const makeArtistRef = (
  overrides: Partial<ArtistRef> = {},
): ArtistRef => ({
  id: "artist-1",
  name: "Test Artist",
  ...overrides,
});

export const makeTrackSummary = (
  overrides: Partial<TrackSummary> = {},
): TrackSummary => ({
  id: "track-1",
  title: "Test Track",
  genres: ["rock"],
  duration: 180,
  releaseDate: "2024-01-01T00:00:00.000Z",
  trackNumber: 1,
  starred: false,
  album: makeAlbumRef(),
  artists: [makeArtistRef()],
  ...overrides,
});

export const makeTrack = (overrides: Partial<Track> = {}): Track => ({
  id: "track-1",
  title: "Test Track",
  genres: ["rock"],
  duration: 180,
  releaseDate: "2024-01-01T00:00:00.000Z",
  trackNumber: 1,
  discNumber: 1,
  size: 1024,
  album: makeAlbumRef(),
  artists: [makeArtistRef()],
  starred: false,
  ...overrides,
});

export const makeAlbumTrack = (
  overrides: Partial<AlbumTrack> = {},
): AlbumTrack => ({
  id: "album-track-1",
  title: "Test Album Track",
  genres: ["rock"],
  duration: 180,
  trackNumber: 1,
  discNumber: 1,
  album: makeAlbumRef(),
  artists: [makeArtistRef()],
  ...overrides,
});

export const makeAlbumSummary = (
  overrides: Partial<AlbumSummary> = {},
): AlbumSummary => ({
  id: "album-1",
  title: "Test Album",
  releaseDate: "2024-01-01T00:00:00.000Z",
  genres: ["rock"],
  artists: [makeArtistRef()],
  starred: false,
  ...overrides,
});

export const makeAlbum = (overrides: Partial<Album> = {}): Album => ({
  id: "album-1",
  title: "Test Album",
  releaseDate: "2024-01-01T00:00:00.000Z",
  compilation: false,
  genres: ["rock"],
  starred: false,
  artists: [makeArtistRef()],
  tracks: [makeAlbumTrack()],
  ...overrides,
});

export const makeArtistSummary = (
  overrides: Partial<ArtistSummary> = {},
): ArtistSummary => ({
  id: "artist-1",
  name: "Test Artist",
  starred: false,
  ...overrides,
});

export const makeArtist = (overrides: Partial<Artist> = {}): Artist => ({
  id: "artist-1",
  name: "Test Artist",
  bio: "A test artist.",
  starred: false,
  albums: [makeAlbumRef()],
  ...overrides,
});

export const makePlaylistRef = (
  overrides: Partial<PlaylistRef> = {},
): PlaylistRef => ({
  id: "playlist-1",
  name: "Test Playlist",
  ...overrides,
});

export const makePlaylistSummary = (
  overrides: Partial<PlaylistSummary> = {},
): PlaylistSummary => ({
  id: "playlist-1",
  name: "Test Playlist",
  type: PlaylistType.USER,
  albumCoverUrls: ["https://cover/1.jpg"],
  ...overrides,
});

export const makePlaylist = (overrides: Partial<Playlist> = {}): Playlist => ({
  id: "playlist-1",
  name: "Test Playlist",
  description: null,
  ownerId: "user-1",
  type: PlaylistType.USER,
  albumCoverUrls: ["https://cover/1.jpg"],
  ...overrides,
});

export const makePlaylistTrack = (
  overrides: Partial<PlaylistTrack> = {},
): PlaylistTrack => ({
  id: "playlist-track-1",
  trackId: "track-1",
  genres: ["rock"],
  duration: 180,
  trackNumber: 1,
  discNumber: 1,
  title: "Test Track",
  album: makeAlbumRef(),
  artists: [makeArtistRef()],
  ...overrides,
});

export const makeAlbumInteraction = (
  overrides: Partial<AlbumInteraction> = {},
): AlbumInteraction => ({
  type: InteractionType.ALBUM,
  id: "interaction-album-1",
  updatedAt: "2024-01-01T00:00:00.000Z",
  album: makeAlbumRef(),
  artists: [makeArtistRef()],
  coverUrl: "https://cover/album.jpg",
  ...overrides,
});

export const makeArtistInteraction = (
  overrides: Partial<ArtistInteraction> = {},
): ArtistInteraction => ({
  type: InteractionType.ARTIST,
  id: "interaction-artist-1",
  updatedAt: "2024-01-01T00:00:00.000Z",
  artist: makeArtistRef(),
  coverUrl: "https://cover/artist.jpg",
  ...overrides,
});

export const makePlaylistInteraction = (
  overrides: Partial<PlaylistInteraction> = {},
): PlaylistInteraction => ({
  type: InteractionType.PLAYLIST,
  id: "interaction-playlist-1",
  updatedAt: "2024-01-01T00:00:00.000Z",
  playlist: makePlaylistRef(),
  coverUrls: ["https://cover/1.jpg", "https://cover/2.jpg"],
  ...overrides,
});

export const makeInteractions = (): Interaction[] => [
  makeAlbumInteraction(),
  makeArtistInteraction(),
  makePlaylistInteraction(),
];

export const makeSearch = (overrides: Partial<Search> = {}): Search => ({
  albums: [makeAlbumSummary()],
  artists: [makeArtistSummary()],
  tracks: [makeTrackSummary()],
  ...overrides,
});
