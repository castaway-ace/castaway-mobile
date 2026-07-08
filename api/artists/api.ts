import { OrderBy } from "@/constants/api";
import { Artist, ArtistSummary } from "@/types/artists";
import apiClient from "../client";

export enum ArtistOrder {
  NAME = "name",
}

interface ArtistParams {
  limit: number;
  offset: number;
  order: ArtistOrder;
  orderBy: OrderBy;
  starred: boolean;
}

export const artistApi = {
  getAll: async ({
    limit,
    offset,
    order,
    orderBy,
    starred,
  }: ArtistParams): Promise<ArtistSummary[]> => {
    const { data } = await apiClient.get<ArtistSummary[]>("/artists", {
      params: { limit, offset, order, orderBy, starred },
    });
    return data;
  },

  getOne: async (id: string): Promise<Artist> => {
    const { data } = await apiClient.get<Artist>(`/artists/${id}`);
    return data;
  },

  getImage: async (id: string): Promise<string> => {
    const { data } = await apiClient.get<string>(`/artists/${id}/image`);
    return data;
  },

  star: async (id: string): Promise<void> => {
    await apiClient.post(`/artists/${id}/star`);
  },

  unStar: async (id: string): Promise<void> => {
    await apiClient.delete(`/artists/${id}/star`);
  },
};
