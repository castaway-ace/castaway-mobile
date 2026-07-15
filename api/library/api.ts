import { LibraryItem } from "@/types/library";
import apiClient from "../client";

/** Query parameters accepted by the library endpoint. */
export interface LibraryParams {
  limit: number;
  offset: number;
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
  /** Fetches a page of the user's library, most recently opened first. */
  getAll: async ({ limit, offset }: LibraryParams): Promise<LibraryItem[]> => {
    const { data } = await apiClient.get<LibraryItem[]>("/library", {
      params: { limit, offset },
    });
    return data;
  },
};
