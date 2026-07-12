import { OrderBy } from "@/constants/api";
import { Album, AlbumSummary } from "@/types/albums";
import apiClient from "../client";

/** Field the backend sorts albums by. Pairs with {@link OrderBy} for direction. */
export enum AlbumOrder {
  TITLE = "title",
  YEAR = "year",
  ADDED = "added",
}

interface AlbumParams {
  limit: number;
  offset: number;
  order: AlbumOrder;
  orderBy: OrderBy;
  /** When true, returns only albums the user has starred (their library). */
  starred: boolean;
}

/**
 * Transport layer for the `/albums` endpoints — one method per route, returning
 * parsed bodies. Free of caching/React concerns; see {@link apiClient} for auth.
 */
export const albumApi = {
  /**
   * Fetches a page of album summaries.
   *
   * @returns The requested page; a page shorter than `limit` means the end.
   */
  getAll: async ({
    limit,
    offset,
    order,
    orderBy,
    starred,
  }: AlbumParams): Promise<AlbumSummary[]> => {
    const { data } = await apiClient.get<AlbumSummary[]>("/albums", {
      params: { limit, offset, order, orderBy, starred },
    });
    return data;
  },

  /** Fetches a single album with its full track listing. */
  getOne: async (id: string): Promise<Album> => {
    const { data } = await apiClient.get<Album>(`/albums/${id}`);
    return data;
  },

  /**
   * Fetches the album's cover art URL.
   *
   * @remarks
   * Split from {@link getOne} so it can be cached on its own long-lived key and
   * reused wherever a cover is shown (lists, the player) without pulling the
   * whole album.
   */
  getCover: async (id: string): Promise<string> => {
    const { data } = await apiClient.get<string>(`/albums/${id}/cover`);
    return data;
  },

  /** Stars the album (adds it to the user's library). */
  star: async (id: string): Promise<void> => {
    await apiClient.post(`/albums/${id}/star`);
  },

  /** Unstars the album. */
  unStar: async (id: string): Promise<void> => {
    await apiClient.delete(`/albums/${id}/star`);
  },
};
