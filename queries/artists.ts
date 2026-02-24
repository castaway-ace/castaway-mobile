import { artistApi } from "@/api/artists";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useArtists = () => {
    return useInfiniteQuery({
        queryKey: ['artists'],
        queryFn: ({ pageParam }) => artistApi.getAll(pageParam, 20),
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.data.length < 20) {
                return undefined;
            }
            return allPages.length + 1;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        initialPageParam: 1,
    });
}