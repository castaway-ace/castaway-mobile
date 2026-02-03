import { trackApi } from "@/api/tracks";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const useTracks = () => {
    return useInfiniteQuery({
        queryKey: ['tracks'],
        queryFn: ({ pageParam }) => trackApi.getAll(pageParam, 20),
        getNextPageParam: (lastPage, allPages) => {
            // If the last page has fewer items than pageSize, we're done
            if (lastPage.data.length < 20) {
                return undefined;
            }
            // Otherwise, fetch the next page
            return allPages.length + 1;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        initialPageParam: 1,
    });
}

export const useTrack = (id: string) => {
    return useQuery({
        queryKey: ['track', id],
        queryFn: () => trackApi.getById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
};