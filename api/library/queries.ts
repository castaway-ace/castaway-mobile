import { STALE_TIME } from "@/constants/query";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { libraryApi, LibraryParams } from "./api";

/** Caller-tunable knobs for {@link useLibrary}; omitted fields fall back to {@link DEFAULT_LIBRARY_OPTIONS}. */
export type LibraryOptions = LibraryParams;

/**
 * @remarks
 * `limit` sits at the endpoint's maximum rather than its default of 100, since
 * the library screen renders the whole list in one scroll and has no paging
 * affordance — a lower limit would silently hide the tail.
 *
 * No `type` key: the default is "no filter", which is `undefined` rather than a
 * value. React Query hashes keys through `JSON.stringify`, which drops
 * `undefined`, so the unfiltered query keeps the same cache entry it would have
 * had before the filter existed.
 */
const DEFAULT_LIBRARY_OPTIONS: LibraryOptions = {
  limit: 200,
  offset: 0,
};

/**
 * The user's library: their playlists (Liked Songs included) plus every album
 * and artist they've favorited, ordered by how recently each was opened.
 *
 * @remarks
 * `SHORT` stale time because the list reorders as the user opens things and
 * changes as they star or create — it should refresh soon after focus rather
 * than serve a long-cached snapshot.
 *
 * Ordering, filtering, and cover art are all the server's job here, so this is a
 * plain `useQuery` over one endpoint. Every mutation that changes library
 * membership (starring, playlist create/delete), its order (recording an
 * interaction), or its artwork (playlist track edits, liking a track)
 * invalidates {@link queryKeys.library}, whose `all` key prefix-matches every
 * `type` variant at once.
 *
 * `keepPreviousData` because `type` is driven by a filter the user taps: without
 * it, every tap would tear the list down to skeletons for a round trip. Instead
 * the previous list stays on screen until the new one lands. The cost is that
 * the visible list briefly disagrees with the selected pill — the standard trade,
 * and the same one Spotify makes. Combined with `SHORT` stale time, re-tapping a
 * filter within five minutes is served from cache with no refetch at all.
 *
 * @param options - Partial overrides merged over {@link DEFAULT_LIBRARY_OPTIONS}.
 */
export const useLibrary = (options: Partial<LibraryOptions> = {}) => {
  const { limit, offset, type } = { ...DEFAULT_LIBRARY_OPTIONS, ...options };
  return useQuery({
    queryKey: queryKeys.library.list({ limit, offset, type }),
    queryFn: () => libraryApi.getAll({ limit, offset, type }),
    staleTime: STALE_TIME.SHORT,
    placeholderData: keepPreviousData,
  });
};
