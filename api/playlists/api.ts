import { OrderBy } from "@/constants/api";
import {
  Playlist,
  PlaylistRef,
  PlaylistSummary,
  PlaylistTrack,
} from "@/types/playlist";
import apiClient from "../client";

/** Field the backend sorts playlists by. Pairs with {@link OrderBy} for direction. */
export enum PlaylistOrder {
  NAME = "name",
  ADDED = "added",
}

/** Query parameters accepted by the paginated list endpoint. */
interface PlaylistParams {
  limit: number;
  offset: number;
  order: PlaylistOrder;
  orderBy: OrderBy;
  /**
   * When true, narrows results to hand-made ({@link PlaylistType.USER})
   * playlists, excluding the system-managed Liked Songs.
   *
   * @remarks
   * Not an ownership filter despite the name — the endpoint already returns only
   * the caller's own playlists either way.
   */
  onlyUser: boolean;
}

/**
 * Transport layer for the `/playlists` endpoints — one method per backend
 * route, each resolving to the parsed response body.
 *
 * @remarks
 * Intentionally free of caching, React, or invalidation concerns so it can be
 * consumed both by the query/mutation hooks in this folder and by imperative
 * call sites (e.g. the audio player resolving a track before playback). Auth
 * headers and token refresh are handled upstream by {@link apiClient}.
 */
export const playlistApi = {
  /**
   * Fetches a page of playlist summaries.
   *
   * @param params - Pagination window ({@link PlaylistParams.limit} /
   * {@link PlaylistParams.offset}), sort field, direction, and ownership filter.
   * @returns The requested page; a page shorter than `limit` signals the end.
   */
  getAll: async ({
    limit,
    offset,
    order,
    orderBy,
    onlyUser,
  }: PlaylistParams): Promise<PlaylistSummary[]> => {
    const { data } = await apiClient.get<PlaylistSummary[]>("/playlists", {
      params: { limit, offset, order, orderBy, onlyUser },
    });
    return data;
  },

  /** Fetches a single playlist's metadata (name, type, cover art) by id. */
  getOne: async (id: string): Promise<Playlist> => {
    const { data } = await apiClient.get<Playlist>(`/playlists/${id}`);
    return data;
  },

  /**
   * Creates an empty user playlist.
   *
   * @returns A reference to the new playlist (its id), not the full entity, so
   * the caller can navigate to or seed it without a second round trip.
   */
  create: async (name: string): Promise<PlaylistRef> => {
    const { data } = await apiClient.post<PlaylistRef>(`/playlists`, {
      name,
    });
    return data;
  },

  /** Renames an existing playlist. */
  update: async (id: string, body: { name: string }): Promise<void> => {
    await apiClient.patch(`/playlists/${id}`, body);
  },

  /** Permanently deletes a playlist. */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/playlists/${id}`);
  },

  /** Fetches the ordered tracks of a playlist. */
  getAllTracks: async (playlistId: string): Promise<PlaylistTrack[]> => {
    const { data } = await apiClient.get<PlaylistTrack[]>(
      `/playlists/${playlistId}/tracks`,
    );
    return data;
  },

  /**
   * Fetches a single playlist entry.
   *
   * @remarks
   * `trackId` is the underlying track; the returned {@link PlaylistTrack} also
   * carries the playlist-scoped entry id used for reordering and removal.
   */
  getTrack: async (
    playlistId: string,
    trackId: string,
  ): Promise<PlaylistTrack> => {
    const { data } = await apiClient.get<PlaylistTrack>(
      `/playlists/${playlistId}/tracks/${trackId}`,
    );
    return data;
  },

  /** Adds a track to a playlist. */
  addTrack: async (playlistId: string, trackId: string): Promise<void> => {
    await apiClient.post(`/playlists/${playlistId}/tracks/${trackId}`);
  },

  /** Removes a track from a playlist. */
  deleteTrack: async (playlistId: string, trackId: string): Promise<void> => {
    await apiClient.delete(`/playlists/${playlistId}/tracks/${trackId}`);
  },
};
