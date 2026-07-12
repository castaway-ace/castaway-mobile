import { Interaction } from "@/types/interactions";
import apiClient from "../client";

/**
 * Transport layer for the `/interactions` endpoints.
 *
 * @remarks
 * "Interactions" are the user's recent engagement with albums, artists, and
 * playlists — the backend uses them to power recently-played / recommended rows
 * and, notably, some cover-art surfaces. Recording an interaction bumps its
 * recency; the `createOrUpdate*` calls are fire-and-forget from the caller's
 * point of view.
 */
export const interactionApi = {
  /** Fetches the user's interaction feed across all entity types. */
  getAll: async (): Promise<Interaction[]> => {
    const { data } = await apiClient.get<Interaction[]>("/interactions");
    return data;
  },

  /** Records (or refreshes) an interaction with an album. */
  createOrUpdateAlbum: async (id: string): Promise<void> => {
    await apiClient.post(`/interactions/albums/${id}`);
  },

  /** Records (or refreshes) an interaction with an artist. */
  createOrUpdateArtist: async (id: string): Promise<void> => {
    await apiClient.post(`/interactions/artists/${id}`);
  },

  /** Records (or refreshes) an interaction with a playlist. */
  createOrUpdatePlaylist: async (id: string): Promise<void> => {
    await apiClient.post(`/interactions/playlists/${id}`);
  },
};
