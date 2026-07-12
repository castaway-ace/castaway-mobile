import { Search } from "@/types/search";
import apiClient from "../client";

/** Transport layer for the `/search` endpoint. */
export const searchApi = {
  /**
   * Runs a full-text search, returning matches grouped by entity type (tracks,
   * albums, artists, playlists).
   *
   * @param input - Raw user query; callers are expected to trim/debounce it
   * (see the search query hook) before it reaches here.
   */
  get: async (input: string): Promise<Search> => {
    const { data } = await apiClient.get<Search>("/search", {
      params: { query: input },
    });
    return data;
  },
};
