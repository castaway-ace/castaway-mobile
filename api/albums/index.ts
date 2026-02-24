import { Album, AlbumItemsResponse } from "@/types/albums";
import apiClient from "../client";

export const albumApi = {
  getAll: async (): Promise<AlbumItemsResponse> => {
    const { data } = await apiClient.get('/music/albums');
    return data;
  },

  getById: async (id: string): Promise<Album> => {
    const { data } = await apiClient.get(`/music/albums/${id}`);
    return data.data;
  },
};