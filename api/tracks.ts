import apiClient from './client';

export interface Track {
    id: string;
    title: string;
    duration: number;
  }

  export interface TracksResponse {
    statusCode: number;
    data: Track[];
  }

  export const trackApi = {
    getAll: async (page = 1, pageSize = 20): Promise<TracksResponse> => {
      const { data } = await apiClient.get('/music/tracks', {
        params: { page, pageSize },
      });
      return data;
    },
    
    getById: async (id: string): Promise<Track> => {
      const { data } = await apiClient.get(`/music/tracks/${id}`);
      return data;
    },
  };