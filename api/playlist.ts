import { Playlist } from "@/types/playlist";
import apiClient from "./client";

export const playlistApi = {
  getAll: async (): Promise<Playlist[]> => {
    const { data } = await apiClient.get('/playlists');
    return data;
  },

  getById: async (id: string): Promise<Playlist> => {
    const { data } = await apiClient.get(`/playlists/${id}`);
    return data;
  },
};