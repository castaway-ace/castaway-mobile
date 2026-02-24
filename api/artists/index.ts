import { ArtistItemsResponse } from "@/types/artists";
import apiClient from "../client";

export const artistApi = {
  getAll: async (page = 1, pageSize = 20): Promise<ArtistItemsResponse> => {
    const { data } = await apiClient.get('/music/artists', {
      params: { page, pageSize },
    });
    return data;
  },
};