import { Interaction } from "../types/interactions";
import apiClient from "./client";

export const interactionApi = {
    getAll: async (): Promise<Interaction[]> => {
        const { data } = await apiClient.get('/interactions');
        return data;
    },

    createOrUpdateAlbum: async (id: string): Promise<void> => {
        await apiClient.post(`/interactions/albums/${id}`);
    },

    createOrUpdateArtist: async (id: string): Promise<void> => {
        await apiClient.post(`/interactions/artists/${id}`);
    },

    createOrUpdatePlaylist: async (id: string): Promise<void> => {
        await apiClient.post(`/interactions/playlists/${id}`);
    },
};