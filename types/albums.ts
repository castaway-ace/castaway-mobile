import { Track } from "./tracks";

export interface Album {
    id: string,
    title: string,
    releaseDate: string,
    genre: string,
    imageUrl: string,
    compilation: boolean,
    artists: string[],
    tracks: Track[],
}

export interface AlbumSummary {
    id: string,
    title: string,
    releaseDate: string,
    genre: string,
    imageUrl: string,
    artists: string[],
}