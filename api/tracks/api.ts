import { OrderBy } from "@/constants/api";
import { Track, TrackSummary } from "@/types/tracks";
import apiClient from "../client";

/** Field the backend sorts tracks by. Pairs with {@link OrderBy} for direction. */
export enum TrackOrder {
  TITLE = "title",
  ALBUM = "album",
  YEAR = "year",
  ADDED = "added",
}

interface TrackParams {
  limit: number;
  offset: number;
  order: TrackOrder;
  orderBy: OrderBy;
  /** When true, returns only starred tracks (the user's Liked Songs). */
  starred: boolean;
}

/**
 * Transport layer for the `/tracks` endpoints — one method per route, returning
 * parsed bodies. Free of caching/React concerns; see {@link apiClient} for auth.
 *
 * @remarks
 * The audio stream itself is *not* fetched here: the player streams from
 * `/tracks/:id/stream` directly through the media engine (see the audio player
 * context), since binary streaming doesn't fit this JSON transport.
 */
export const trackApi = {
  /**
   * Fetches a page of track summaries.
   *
   * @returns The requested page; a page shorter than `limit` means the end.
   */
  getAll: async ({
    limit,
    offset,
    order,
    orderBy,
    starred,
  }: TrackParams): Promise<TrackSummary[]> => {
    const { data } = await apiClient.get<TrackSummary[]>("/tracks", {
      params: { limit, offset, order, orderBy, starred },
    });
    return data;
  },

  /** Fetches a single track's full metadata by id. */
  getOne: async (id: string): Promise<Track> => {
    const { data } = await apiClient.get<Track>(`/tracks/${id}`);
    return data;
  },

  /** Stars the track (adds it to Liked Songs). */
  star: async (id: string): Promise<void> => {
    await apiClient.post(`/tracks/${id}/star`);
  },

  /** Unstars the track. */
  unStar: async (id: string): Promise<void> => {
    await apiClient.delete(`/tracks/${id}/star`);
  },
};
