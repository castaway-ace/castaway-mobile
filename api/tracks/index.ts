import { StreamItem, Track, TrackItemsResponse } from "@/types/tracks";
import apiClient from "../client";

export const trackApi = {
  getAll: async (page = 1, pageSize = 20): Promise<TrackItemsResponse> => {
    const { data } = await apiClient.get('/music/tracks', {
      params: { page, pageSize },
    });
    return data;
  },

  getAlbumArt: async (albumId: string): Promise<StreamItem> => {
    const { data } = await apiClient.get(`/music/albums/${albumId}/art`);
    return data
  },

  getById: async (id: string): Promise<Track> => {
    const { data } = await apiClient.get(`/music/tracks/${id}`);
    return data.data;
  },

  getStream: async (id: string): Promise<StreamItem> => {
    const { data } = await apiClient.get(`/music/tracks/${id}/stream`);
    return data
  }
};