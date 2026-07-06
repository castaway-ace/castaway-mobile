import { Search } from "@/types/search";
import apiClient from "../client";

export const searchApi = {
  get: async (input: string): Promise<Search> => {
    const { data } = await apiClient.get<Search>('/search', {
      params: { query: input },
    });
    return data;
  },
};