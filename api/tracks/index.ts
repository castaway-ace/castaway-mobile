import { Track, TrackItemsResponse } from "@/types/tracks";
import apiClient from "../client";

export const trackApi = {
  getAll: async (page = 1, pageSize = 20): Promise<TrackItemsResponse> => {
    const { data } = await apiClient.get('/music/tracks', {
      params: { page, pageSize },
    });
    return data;
  },

  getById: async (id: string): Promise<Track> => {
    const { data } = await apiClient.get(`/music/tracks/${id}`);
    return data.data;
  },
};