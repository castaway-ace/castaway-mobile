import { GC_TIME, STALE_TIME } from "@/constants/query";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { searchApi } from "./api";

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