import { Track } from "@/types/tracks";
import { OrderBy } from "./albums";
import apiClient from "./client";

export enum TrackOrder {
  TITLE = 'title',
  ALBUM = 'album',
  YEAR = 'year',
  ADDED = 'added',
}

interface TrackParams {
  limit: number
  offset: number
  order: TrackOrder
  orderBy: OrderBy
  starred: boolean
}

export const trackApi = {
  getAll: async ({limit, offset, order, orderBy, starred}: TrackParams): Promise<Track[]> => {
    const { data } = await apiClient.get('/tracks', {
      params: { limit, offset, order, orderBy, starred },
    });
    return data;
  },

  getById: async (id: string): Promise<Track> => {
    const { data } = await apiClient.get(`/tracks/${id}`);
    return data;
  },

  getStream: async (id: string): Promise<string> => {
    const { data } = await apiClient.get(`/tracks/${id}/stream`);
    return data;
  },
};