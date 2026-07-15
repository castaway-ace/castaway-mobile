import { STALE_TIME } from "@/constants/query";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { interactionApi } from "./api";

/**
 * The user's interaction feed (recently engaged albums, artists, playlists).
 *
 * @remarks
 * `SHORT` stale time because this drives recency-ordered home rows and some
 * cover-art surfaces, both of which should feel live. Star/playlist mutations
 * explicitly invalidate {@link queryKeys.interactions} to force a refresh here.
 */
export const useInteractions = () => {
    return useQuery({
        queryKey: queryKeys.interactions,
        queryFn: () => interactionApi.getAll(),
        staleTime: STALE_TIME.SHORT,
    });
}
