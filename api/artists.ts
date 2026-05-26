import { Artist } from "@/types/artists";
import apiClient from "./client";

export const artistApi = {
  getAll: async (limit = 100, offset = 0): Promise<Artist[]> => {
    const { data } = await apiClient.get('/artists', {
      params: { limit, offset },
    });
    return data;
  },

  getStream: async (id: string): Promise<string> => {
    const { data } = await apiClient.get(`/artists/${id}/stream`);
    return data;
  },
};