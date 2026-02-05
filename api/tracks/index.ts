import { Track, TrackItemsResponse } from "@/types/tracks";
import apiClient, { baseUrl } from "../client";

export const trackApi = {
  getAll: async (page = 1, pageSize = 20): Promise<TrackItemsResponse> => {
    const { data } = await apiClient.get('/music/tracks', {
      params: { page, pageSize },
    });
    return data;
  },

  getAlbumArtUrl: (albumId: string): string => {
    return `${baseUrl}/music/albums/${albumId}/art`;
  },

  getById: async (id: string): Promise<Track> => {
    const { data } = await apiClient.get(`/music/tracks/${id}`);
    return data.data;
  },

  getStream: (id: string): string => {
    return `${baseUrl}/music/tracks/${id}/stream`;
  }
};