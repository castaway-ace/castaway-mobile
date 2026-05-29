import { artistApi, ArtistOrder } from "@/api/artists";
import { useInfiniteQuery } from "@tanstack/react-query";
import { OrderBy } from "../albums";

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
        queryKey: ['artists', { limit, order, orderBy, starred }],
        queryFn: ({ pageParam }) => artistApi.getAll({ limit, offset: pageParam, orderBy, order, starred }),
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