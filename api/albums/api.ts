import { OrderBy } from "@/constants/api";
import { Album, AlbumSummary } from "@/types/albums";
import apiClient from "../client";

export enum AlbumOrder {
  TITLE = 'title',
  YEAR = 'year',
  ADDED = 'added',
}

interface AlbumParams {
  limit: number
  offset: number
  order: AlbumOrder
  orderBy: OrderBy
  starred: boolean
}

export const albumApi = {
  getAll: async ({limit, offset, order, orderBy, starred}: AlbumParams): Promise<AlbumSummary[]> => {
    const { data } = await apiClient.get('/albums', {
      params: { limit, offset, order, orderBy, starred },
    });
    return data;
  },

  getOne: async (id: string): Promise<Album> => {
    const { data } = await apiClient.get(`/albums/${id}`);
    return data;
  },

  getCover: async (id: string): Promise<string> => {
    const { data } = await apiClient.get(`/albums/${id}/cover`);
    return data;
  },

  star: async (id: string): Promise<void> => {
    await apiClient.post(`/albums/${id}/star`);
  },

  unStar: async (id: string): Promise<void> => {
    await apiClient.delete(`/albums/${id}/star`);
  },
};