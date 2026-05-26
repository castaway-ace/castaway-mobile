import { artistApi } from "@/api/artists";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 100;

export const useArtists = () => {
    return useInfiniteQuery({
        queryKey: ['artists'],
        queryFn: ({ pageParam }) => artistApi.getAll(PAGE_SIZE, pageParam),
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

export const useArtistCover = (id: string) => {
    return useQuery({
        queryKey: ['artist-image', id],
        queryFn: () => artistApi.getStream(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
}