import { trackApi, TrackOrder } from "@/api/tracks";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { OrderBy } from "../albums";

interface TrackOptions {
    order: TrackOrder
    orderBy: OrderBy,
    limit: number,
    starred: boolean
}

const DEFAULT_TRACK_OPTIONS: TrackOptions = {
    limit: 100,
    order: TrackOrder.TITLE,
    orderBy: OrderBy.ASC,
    starred: false,
};

export const useTracks = (options: Partial<TrackOptions> = {}) => {
    const { limit, orderBy, order, starred } = { ...DEFAULT_TRACK_OPTIONS, ...options };
    return useInfiniteQuery({
        queryKey: ['tracks', { limit, order, orderBy, starred }],
        queryFn: ({ pageParam }) => trackApi.getAll({ limit, offset: pageParam, orderBy, order, starred }),
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

export const useTrack = (id: string) => {
    return useQuery({
        queryKey: ['track', id],
        queryFn: () => trackApi.getById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
};