import { OrderBy } from "@/constants/api";
import { GC_TIME, STALE_TIME } from "@/constants/query";
import { queryOptions, skipToken, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { ArtistOrder, artistApi } from "./api";

/** Caller-tunable knobs for {@link useArtists}; omitted fields fall back to {@link DEFAULT_ARTIST_OPTIONS}. */
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

/**
 * Infinite, paginated list of artists. `SHORT` stale time so library changes
 * show quickly; pagination ends on a short page. Pass `{ starred: true }` for
 * the library view.
 *
 * @param options - Partial overrides merged over {@link DEFAULT_ARTIST_OPTIONS}.
 */
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

/** A single artist with their discography; idles until `id` resolves. `LONG` stale. */
export const useArtist = (id: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.artists.detail(id),
        queryFn: id ? () => artistApi.getOne(id) : skipToken,
        staleTime: STALE_TIME.LONG,
    });
};

/**
 * Shared query definition for an artist's image URL.
 *
 * @remarks
 * Exposed as `queryOptions` (mirroring {@link albumCoverQueryOptions}) so the
 * image can be read both from list components and imperatively off the same
 * cache entry. `LONG` stale time because the URL rarely changes.
 */
export const artistImageQueryOptions = (id: string | undefined) =>
    queryOptions({
        queryKey: queryKeys.artists.image(id),
        queryFn: id ? () => artistApi.getImage(id) : skipToken,
        staleTime: STALE_TIME.LONG,
    });

/** Hook form of {@link artistImageQueryOptions}. */
export const useArtistImage = (id: string | undefined) =>
    useQuery(artistImageQueryOptions(id));
