import { OrderBy } from "@/constants/api";
import { GC_TIME, STALE_TIME } from "@/constants/query";
import { queryOptions, skipToken, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { albumApi, AlbumOrder } from "./api";

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
        queryKey: queryKeys.albums.list({ limit, order, orderBy, starred }),
        queryFn: ({ pageParam }) => albumApi.getAll({ limit, offset: pageParam, orderBy, order, starred }),
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < limit) {
                return undefined;
            }
            return allPages.length * limit;
        },
        staleTime: STALE_TIME.SHORT,
        gcTime: GC_TIME,
        initialPageParam: 0,
    });
}

export const useAlbum = (id: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.albums.detail(id),
        queryFn: id ? () => albumApi.getOne(id) : skipToken,
        staleTime: STALE_TIME.LONG,
    });
};

export const albumCoverQueryOptions = (id: string | undefined) =>
    queryOptions({
        queryKey: queryKeys.albums.cover(id),
        queryFn: id ? () => albumApi.getCover(id) : skipToken,
        staleTime: STALE_TIME.LONG,
    });

export const useAlbumCover = (id: string | undefined) =>
    useQuery(albumCoverQueryOptions(id));
