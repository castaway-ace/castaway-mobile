import { Playlist } from "@/types/playlist";
import { Track } from "../types/tracks";
import apiClient from "./client";

export const playlistApi = {
  getAll: async (): Promise<Playlist[]> => {
    const { data } = await apiClient.get('/playlists');
    return data;
  },

  getOne: async (id: string): Promise<Playlist> => {
    const { data } = await apiClient.get(`/playlists/${id}`);
    return data;
  },

  update: async (id: string, body: {name: string}): Promise<void> => {
    await apiClient.patch(`/playlists/${id}`, body);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/playlists/${id}`);
  },

  getAllTracks: async (id: string): Promise<Track[]> => {
    const { data } = await apiClient.get(`/playlists/${id}/tracks`);
    return data
  },

  getTrack: async (playlistId: string, trackId: string): Promise<Track> => {
    const { data } = await apiClient.get(`/playlists/${playlistId}/tracks/${trackId}`);
    return data
  },

  addTrack: async (playlistId: string, trackId: string): Promise<void> => {
    await apiClient.post(`/playlists/${playlistId}/tracks/${trackId}`);
  },

  deleteTrack: async (playlistId: string, trackId: string): Promise<void> => {
    await apiClient.delete(`/playlists/${playlistId}/tracks/${trackId}`);
  },
};