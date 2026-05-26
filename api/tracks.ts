import { Track } from "@/types/tracks";
import apiClient from "./client";

export const trackApi = {
  getAll: async (limit = 100, offset = 0): Promise<Track[]> => {
    const { data } = await apiClient.get('/tracks', {
      params: { limit, offset },
    });
    return data;
  },

  getById: async (id: string): Promise<Track> => {
    const { data } = await apiClient.get(`/tracks/${id}`);
    return data;
  },
};