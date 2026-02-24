import { albumApi } from "@/api/albums";
import { useQuery } from "@tanstack/react-query";

export const useAlbums = () => {
    return useQuery({
        queryKey: ['albums'],
        queryFn: () => albumApi.getAll(),
    });
}

export const useAlbum = (id: string) => {
    return useQuery({
        queryKey: ['album', id],
        queryFn: () => albumApi.getById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
};