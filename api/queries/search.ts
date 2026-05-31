import { useQuery } from "@tanstack/react-query";
import { searchApi } from "../search";

export const useSearch = (input: string) => {
    return useQuery({
        queryKey: ['tracks', input],
        queryFn: () => searchApi.get(input),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}