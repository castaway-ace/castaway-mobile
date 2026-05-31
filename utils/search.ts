import { BASE_URL } from "@/api/client";
import { Search } from "@/types/search";

export interface SearchItemElements {
    imageUrl: string;
    text: string;
    subText?: string;
}

export const organizeSearch = (search: Search | undefined): SearchItemElements[] => {

    if (!search) {
        return []
    }

    const result: SearchItemElements[] = []

    search.albums.forEach((album) => {
        result.push(
            {
                imageUrl: `${BASE_URL}/albums/${album.id}/stream`,
                text: album.title,
                subText: `Album • ${album.artists.map((artist) => artist).join(", ")}`,
            }
        )
    })

    search.artists.forEach((artist) => {
        result.push(
            {
                imageUrl: `${BASE_URL}/artists/${artist.id}/stream`,
                text: artist.name,
                subText: "Artist"
            }
        )
    })

    search.tracks.forEach((track) => {
        result.push(
            {
                imageUrl: `${BASE_URL}/albums/${track.albumId}/stream`,
                text: track.title,
                subText: `Track • ${track.artistNames.map((artist) => artist).join(", ")}`,
            }
        )
    })

    return result;
}