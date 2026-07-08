import { OrderBy } from "@/constants/api";
import { Track, TrackSummary } from "@/types/tracks";
import apiClient from "../client";

export enum TrackOrder {
  TITLE = "title",
  ALBUM = "album",
  YEAR = "year",
  ADDED = "added",
}

interface TrackParams {
  limit: number;
  offset: number;
  order: TrackOrder;
  orderBy: OrderBy;
  starred: boolean;
}

export const trackApi = {
  getAll: async ({
    limit,
    offset,
    order,
    orderBy,
    starred,
  }: TrackParams): Promise<TrackSummary[]> => {
    const { data } = await apiClient.get<TrackSummary[]>("/tracks", {
      params: { limit, offset, order, orderBy, starred },
    });
    return data;
  },

  getOne: async (id: string): Promise<Track> => {
    const { data } = await apiClient.get<Track>(`/tracks/${id}`);
    return data;
  },

  star: async (id: string): Promise<void> => {
    await apiClient.post(`/tracks/${id}/star`);
  },

  unStar: async (id: string): Promise<void> => {
    await apiClient.delete(`/tracks/${id}/star`);
  },
};
