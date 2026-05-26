import { albumApi } from "@/api/albums";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 100;

export const useAlbums = () => {
    return useInfiniteQuery({
        queryKey: ['albums'],
        queryFn: ({ pageParam }) => albumApi.getAll(PAGE_SIZE, pageParam),
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

export const useAlbum = (id: string) => {
    return useQuery({
        queryKey: ['album', id],
        queryFn: () => albumApi.getById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
};

export const useAlbumCover = (id: string) => {
    return useQuery({
        queryKey: ['album-cover', id],
        queryFn: () => albumApi.getStream(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
}