export interface Album {
    id: string,
    name: string,
    title: string,
    releaseYear: string,
    genre: string,
    albumArtKey: string,
}

export interface AlbumItemsResponse {
    statusCode: number;
    data: Album[];
}