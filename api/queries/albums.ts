import { albumApi, AlbumOrder, OrderBy } from "@/api/albums";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

interface AlbumOptions {
    order: AlbumOrder
    orderBy: OrderBy,
    limit: number,
    starred: boolean
}

const DEFAULT_ALBUM_OPTIONS: AlbumOptions = {
    limit: 100,
    order: AlbumOrder.TITLE,
    orderBy: OrderBy.ASC,
    starred: false,
};

export const useAlbums = (options: Partial<AlbumOptions> = {}) => {
    const { limit, orderBy, order, starred } = { ...DEFAULT_ALBUM_OPTIONS, ...options };
    return useInfiniteQuery({
        queryKey: ['albums', { limit, order, orderBy, starred }],
        queryFn: ({ pageParam }) => albumApi.getAll({ limit, offset: pageParam, orderBy, order, starred }),
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < limit) {
                return undefined;
            }
            return allPages.length * limit;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        initialPageParam: 0,
    });
}

export const useAlbum = (id: string) => {
    return useQuery({
        queryKey: ['album', id],
        queryFn: () => albumApi.getOne(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
};

export const albumCoverQueryOptions = (id: string | undefined) => ({
    queryKey: ["albumCover", id],
    queryFn: () => {
        if (!id) return undefined;
        return albumApi.getCover(id);
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
});

export const useAlbumCover = (id: string | undefined) =>
    useQuery(albumCoverQueryOptions(id));