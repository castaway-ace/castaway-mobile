import { OrderBy } from "@/constants/api";
import { STALE_TIME } from "@/constants/query";
import { queryOptions, skipToken, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { albumApi, AlbumOrder } from "./api";

/** Caller-tunable knobs for {@link useAlbums}; omitted fields fall back to {@link DEFAULT_ALBUM_OPTIONS}. */
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

/**
 * Infinite, paginated list of albums. `SHORT` stale time so newly starred
 * albums appear promptly; pagination stops once a page returns fewer than
 * `limit` rows. Pass `{ starred: true }` for the library view.
 *
 * @param options - Partial overrides merged over {@link DEFAULT_ALBUM_OPTIONS}.
 */
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
        initialPageParam: 0,
    });
}

/** A single album with its tracks; idles until `id` resolves. `LONG` stale — album metadata is stable. */
export const useAlbum = (id: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.albums.detail(id),
        queryFn: id ? () => albumApi.getOne(id) : skipToken,
        staleTime: STALE_TIME.LONG,
    });
};

/**
 * Shared query definition for an album's cover URL.
 *
 * @remarks
 * Exported as a `queryOptions` object, not just a hook, so the same cached cover
 * can be read imperatively too — the audio player calls it to resolve artwork
 * for lock-screen metadata without mounting a component. `LONG` stale time
 * because cover URLs effectively never change.
 */
export const albumCoverQueryOptions = (id: string | undefined) =>
    queryOptions({
        queryKey: queryKeys.albums.cover(id),
        queryFn: id ? () => albumApi.getCover(id) : skipToken,
        staleTime: STALE_TIME.LONG,
    });

/** Hook form of {@link albumCoverQueryOptions}. */
export const useAlbumCover = (id: string | undefined) =>
    useQuery(albumCoverQueryOptions(id));
