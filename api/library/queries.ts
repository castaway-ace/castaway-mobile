import { STALE_TIME } from "@/constants/query";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { libraryApi, LibraryParams } from "./api";

/** Caller-tunable knobs for {@link useLibrary}; omitted fields fall back to {@link DEFAULT_LIBRARY_OPTIONS}. */
export type LibraryOptions = LibraryParams;

/**
 * @remarks
 * `limit` sits at the endpoint's maximum rather than its default of 100, since
 * the library screen renders the whole list in one scroll and has no paging
 * affordance — a lower limit would silently hide the tail.
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
 * Ordering and cover art are the server's job here, so this is a plain
 * `useQuery` over one endpoint. Every mutation that changes library membership
 * (starring, playlist create/delete), its order (recording an interaction), or
 * its artwork (playlist track edits, liking a track) invalidates
 * {@link queryKeys.library} to force a refresh.
 *
 * @param options - Partial overrides merged over {@link DEFAULT_LIBRARY_OPTIONS}.
 */
export const useLibrary = (options: Partial<LibraryOptions> = {}) => {
  const { limit, offset } = { ...DEFAULT_LIBRARY_OPTIONS, ...options };
  return useQuery({
    queryKey: queryKeys.library.list({ limit, offset }),
    queryFn: () => libraryApi.getAll({ limit, offset }),
    staleTime: STALE_TIME.SHORT,
  });
};
