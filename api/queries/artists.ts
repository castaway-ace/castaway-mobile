import { artistApi, ArtistOrder } from "@/api/artists";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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

export const useArtist = (id: string) => {
    return useQuery({
        queryKey: ['artist', id],
        queryFn: () => artistApi.getOne(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
};

export const artistImageQueryOptions = (id: string | undefined) => ({
    queryKey: ["artistImage", id],
    queryFn: () => {
        if (!id) return undefined;
        return artistApi.getImage(id);
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
});

export const useArtistImage = (id: string | undefined) =>
    useQuery(artistImageQueryOptions(id));