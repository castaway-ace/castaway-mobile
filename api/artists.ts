import { Artist, ArtistSummary } from "@/types/artists";
import { OrderBy } from "./albums";
import apiClient from "./client";

export enum ArtistOrder {
  NAME = 'name',
}

interface ArtistParams {
  limit: number
  offset: number
  order: ArtistOrder
  orderBy: OrderBy
  starred: boolean
}

export const artistApi = {
  getAll: async ({limit, offset, order, orderBy, starred}: ArtistParams): Promise<ArtistSummary[]> => {
    const { data } = await apiClient.get('/artists', {
      params: { limit, offset, order, orderBy, starred },
    });
    return data;
  },

  getById: async (id: string): Promise<Artist> => {
    const { data } = await apiClient.get(`/artists/${id}`);
    return data;
  },

  getImage: async (id: string): Promise<string> => {
    const { data } = await apiClient.get(`/albums/${id}/image`);
    return data;
  },
};