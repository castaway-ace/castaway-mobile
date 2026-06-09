import { useAlbumCover } from "@/api/queries/albums";
import { useArtistImage } from "@/api/queries/artists";
import { Search } from "@/types/search";

export interface SearchItemElements {
    imageUrl: string | undefined;
    text: string;
    subText?: string;
}

export const organizeSearch = (search: Search | undefined): SearchItemElements[] => {

    if (!search) {
        return []
    }

    const result: SearchItemElements[] = []

    search.albums.forEach((album) => {
        const { data: albumArtUrl } = useAlbumCover(album?.id);
        result.push(
            {
                imageUrl: albumArtUrl,
                text: album.title,
                subText: `Album • ${album.artists.map((artist) => artist).join(", ")}`,
            }
        )
    })

    search.artists.forEach((artist) => {
        const { data: artistImageUrl } = useArtistImage(artist.id);
        result.push(
            {
                imageUrl: artistImageUrl,
                text: artist.name,
                subText: "Artist"
            }
        )
    })

    search.tracks.forEach((track) => {
        const { data: albumArtUrl } = useAlbumCover(track.albumId);
        result.push(
            {
                imageUrl: albumArtUrl,
                text: track.title,
                subText: `Track • ${track.artistNames.map((artist) => artist).join(", ")}`,
            }
        )
    })

    return result;
}