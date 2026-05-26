import { Album } from "@/types/albums";
import apiClient from "./client";

export const albumApi = {
  getAll: async (limit = 100, offset = 0): Promise<Album[]> => {
    const { data } = await apiClient.get('/albums', {
      params: { limit, offset },
    });
    return data;
  },

  getStream: async (id: string): Promise<string> => {
    const { data } = await apiClient.get(`/albums/${id}/stream`);
    return data;
  },

  getById: async (id: string): Promise<Album> => {
    const { data } = await apiClient.get(`/albums/${id}`);
    return data.data;
  },
};