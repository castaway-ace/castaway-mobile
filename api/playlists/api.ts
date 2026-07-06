import { OrderBy } from "@/constants/api";
import { Playlist, PlaylistRef, PlaylistSummary, PlaylistTrack } from "@/types/playlist";
import apiClient from "../client";

export enum PlaylistOrder {
  NAME = 'name',
  ADDED = 'added',
}

interface PlaylistParams {
  limit: number
  offset: number
  order: PlaylistOrder
  orderBy: OrderBy
  onlyUser: boolean
}

export const playlistApi = {
  getAll: async ({ limit, offset, order, orderBy, onlyUser }: PlaylistParams): Promise<PlaylistSummary[]> => {
    const { data } = await apiClient.get<PlaylistSummary[]>('/playlists', {
      params: { limit, offset, order, orderBy, onlyUser }
    });
    return data;
  },

  getOne: async (id: string): Promise<Playlist> => {
    const { data } = await apiClient.get<Playlist>(`/playlists/${id}`);
    return data;
  },

  create: async (name: string): Promise<PlaylistRef> => {
    const { data } = await apiClient.post<PlaylistRef>(`/playlists`, {
      name,
    });
    return data;
  },

  update: async (id: string, body: { name: string }): Promise<void> => {
    await apiClient.patch(`/playlists/${id}`, body);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/playlists/${id}`);
  },

  getAllTracks: async (playlistId: string): Promise<PlaylistTrack[]> => {
    const { data } = await apiClient.get<PlaylistTrack[]>(`/playlists/${playlistId}/tracks`);
    return data;
  },

  getTrack: async (playlistId: string, trackId: string): Promise<PlaylistTrack> => {
    const { data } = await apiClient.get<PlaylistTrack>(`/playlists/${playlistId}/tracks/${trackId}`);
    return data;
  },

  addTrack: async (playlistId: string, trackId: string): Promise<void> => {
    await apiClient.post(`/playlists/${playlistId}/tracks/${trackId}`);
  },

  deleteTrack: async (playlistId: string, trackId: string): Promise<void> => {
    await apiClient.delete(`/playlists/${playlistId}/tracks/${trackId}`);
  },
};
