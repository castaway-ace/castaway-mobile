import { useQuery } from "@tanstack/react-query";
import { interactionApi } from "./api";

export const useInteractions = () => {
    return useQuery({
        queryKey: ['interactions'],
        queryFn: () => interactionApi.getAll(),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}
