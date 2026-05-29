export interface Album {
    id: string,
    title: string,
    releaseYear: string,
    genre: string,
    imageUrl: string,
    compilation: boolean,
    artists: string[],
}

export interface AlbumSummary {
    id: string,
    title: string,
    releaseYear: string,
    genre: string,
    imageUrl: string,
    artists: string[],
}