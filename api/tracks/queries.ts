import { OrderBy } from "@/constants/api";
import { GC_TIME, STALE_TIME } from "@/constants/query";
import { skipToken, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { trackApi, TrackOrder } from "./api";

/** Caller-tunable knobs for {@link useTracks}; omitted fields fall back to {@link DEFAULT_TRACK_OPTIONS}. */
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

/**
 * Infinite, paginated list of tracks. `SHORT` stale time so likes propagate
 * quickly; pagination ends on a short page. Pass `{ starred: true }` for the
 * user's Liked Songs.
 *
 * @param options - Partial overrides merged over {@link DEFAULT_TRACK_OPTIONS}.
 */
export const useTracks = (options: Partial<TrackOptions> = {}) => {
    const { limit, orderBy, order, starred } = { ...DEFAULT_TRACK_OPTIONS, ...options };
    return useInfiniteQuery({
        queryKey: queryKeys.tracks.list({ limit, order, orderBy, starred }),
        queryFn: ({ pageParam }) => trackApi.getAll({ limit, offset: pageParam, orderBy, order, starred }),
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

/** A single track's full metadata; idles until `id` resolves. `LONG` stale. */
export const useTrack = (id: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.tracks.detail(id),
        queryFn: id ? () => trackApi.getOne(id) : skipToken,
        staleTime: STALE_TIME.LONG,
    });
};
