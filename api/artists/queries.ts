import { OrderBy } from "@/constants/api";
import { GC_TIME, STALE_TIME } from "@/constants/query";
import { queryOptions, skipToken, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { ArtistOrder, artistApi } from "./api";

interface ArtistOptions {
    order: ArtistOrder,
    orderBy: OrderBy,
    limit: number,
    starred: boolean
}

const DEFAULT_ARTIST_OPTIONS: ArtistOptions = {
    limit: 100,
    order: ArtistOrder.NAME,
    orderBy: OrderBy.ASC,
    starred: false,
};

export const useArtists = (options: Partial<ArtistOptions> = {}) => {
    const { limit, orderBy, order, starred } = { ...DEFAULT_ARTIST_OPTIONS, ...options };
    return useInfiniteQuery({
        queryKey: queryKeys.artists.list({ limit, order, orderBy, starred }),
        queryFn: ({ pageParam }) => artistApi.getAll({ limit, offset: pageParam, orderBy, order, starred }),
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

export const useArtist = (id: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.artists.detail(id),
        queryFn: id ? () => artistApi.getOne(id) : skipToken,
        staleTime: STALE_TIME.LONG,
    });
};

export const artistImageQueryOptions = (id: string | undefined) =>
    queryOptions({
        queryKey: queryKeys.artists.image(id),
        queryFn: id ? () => artistApi.getImage(id) : skipToken,
        staleTime: STALE_TIME.LONG,
    });

export const useArtistImage = (id: string | undefined) =>
    useQuery(artistImageQueryOptions(id));
