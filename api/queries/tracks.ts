import { trackApi } from "@/api/tracks";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 100;

export const useTracks = () => {
    return useInfiniteQuery({
        queryKey: ['tracks'],
        queryFn: ({ pageParam }) => trackApi.getAll(PAGE_SIZE, pageParam),
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 20) {
                return undefined;
            }
            return allPages.length * PAGE_SIZE;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        initialPageParam: 0,
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