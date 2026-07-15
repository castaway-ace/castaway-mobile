import { LibraryItem, LibraryItemType } from "@/types/library";
import apiClient from "../client";

/** Query parameters accepted by the library endpoint. */
export interface LibraryParams {
  limit: number;
  offset: number;
  /** Restricts the list to one entity type; omitted returns all three. */
  type?: LibraryItemType;
}

/**
 * Transport layer for the `/library` endpoint.
 *
 * @remarks
 * The library — the user's playlists (Liked Songs included) plus every album and
 * artist they've favorited — is assembled and ordered by the backend and comes
 * back as one recency-sorted list. It deliberately spans all three entity types
 * so a screen can render the whole library from a single request rather than
 * fanning out across `/playlists`, `/albums`, and `/artists` and merging the
 * results itself.
 */
export const libraryApi = {
  /**
   * Fetches a page of the user's library, most recently opened first.
   *
   * @remarks
   * Axios omits `undefined` params, so an unfiltered call sends no `type` at
   * all — which matters because the API rejects unrecognized query params
   * outright rather than ignoring them.
   */
  getAll: async ({
    limit,
    offset,
    type,
  }: LibraryParams): Promise<LibraryItem[]> => {
    const { data } = await apiClient.get<LibraryItem[]>("/library", {
      params: { limit, offset, type },
    });
    return data;
  },
};
