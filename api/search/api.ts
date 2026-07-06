import { Search } from "@/types/search";
import apiClient from "../client";

export const searchApi = {
  get: async (input: string): Promise<Search> => {
    const { data } = await apiClient.get(`/search?query=${input}`);
    return data;
  },
};