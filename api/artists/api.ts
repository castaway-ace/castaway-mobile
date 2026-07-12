import { OrderBy } from "@/constants/api";
import { Artist, ArtistSummary } from "@/types/artists";
import apiClient from "../client";

/** Field the backend sorts artists by. Only name is supported today. */
export enum ArtistOrder {
  NAME = "name",
}

interface ArtistParams {
  limit: number;
  offset: number;
  order: ArtistOrder;
  orderBy: OrderBy;
  /** When true, returns only artists the user has starred (their library). */
  starred: boolean;
}

/**
 * Transport layer for the `/artists` endpoints — one method per route, returning
 * parsed bodies. Free of caching/React concerns; see {@link apiClient} for auth.
 */
export const artistApi = {
  /**
   * Fetches a page of artist summaries.
   *
   * @returns The requested page; a page shorter than `limit` means the end.
   */
  getAll: async ({
    limit,
    offset,
    order,
    orderBy,
    starred,
  }: ArtistParams): Promise<ArtistSummary[]> => {
    const { data } = await apiClient.get<ArtistSummary[]>("/artists", {
      params: { limit, offset, order, orderBy, starred },
    });
    return data;
  },

  /** Fetches a single artist with their discography. */
  getOne: async (id: string): Promise<Artist> => {
    const { data } = await apiClient.get<Artist>(`/artists/${id}`);
    return data;
  },

  /**
   * Fetches the artist's image URL.
   *
   * @remarks
   * Separate endpoint (and cache key) from {@link getOne} so the image can be
   * shown in lists without fetching the full artist. Mirrors album cover art.
   */
  getImage: async (id: string): Promise<string> => {
    const { data } = await apiClient.get<string>(`/artists/${id}/image`);
    return data;
  },

  /** Stars the artist (adds them to the user's library). */
  star: async (id: string): Promise<void> => {
    await apiClient.post(`/artists/${id}/star`);
  },

  /** Unstars the artist. */
  unStar: async (id: string): Promise<void> => {
    await apiClient.delete(`/artists/${id}/star`);
  },
};
