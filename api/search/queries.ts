import { GC_TIME, STALE_TIME } from "@/constants/query";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { searchApi } from "./api";

/**
 * Full-text search results for `input`, keyed on the trimmed query.
 *
 * @remarks
 * Trimming before it becomes the query key means "foo" and "foo " share one
 * cache entry instead of fetching twice. `enabled` short-circuits an empty
 * query so clearing the box neither fires a request nor errors. Callers debounce
 * `input` (see `useDebouncedValue`) so keystrokes don't each trigger a fetch.
 */
export const useSearch = (input: string) => {
    const query = input.trim();
    return useQuery({
        queryKey: queryKeys.search(query),
        queryFn: () => searchApi.get(query),
        enabled: query.length > 0,
        staleTime: STALE_TIME.SHORT,
        gcTime: GC_TIME,
    });
}