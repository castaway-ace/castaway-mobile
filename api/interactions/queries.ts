import { GC_TIME, STALE_TIME } from "@/constants/query";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { interactionApi } from "./api";

export const useInteractions = () => {
    return useQuery({
        queryKey: queryKeys.interactions,
        queryFn: () => interactionApi.getAll(),
        staleTime: STALE_TIME.SHORT,
        gcTime: GC_TIME,
    });
}
