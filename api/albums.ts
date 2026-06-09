import { Album, AlbumSummary } from "@/types/albums";
import apiClient from "./client";

export enum OrderBy {
  ASC = 'asc',
  DESC = 'desc'
}

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

  getById: async (id: string): Promise<Album> => {
    const { data } = await apiClient.get(`/albums/${id}`);
    return data;
  },

  getCover: async (id: string): Promise<string> => {
    const { data } = await apiClient.get(`/albums/${id}/cover`);
    return data;
  },
};