import { Track } from "./tracks";

export interface AlbumArtist {
    id: string;
    name: string;
}

export interface Album {
    id: string,
    title: string,
    releaseDate: string,
    genre: string,
    imageUrl: string,
    compilation: boolean,
    artists: AlbumArtist[],
    starred: boolean,
    tracks: Track[],
}

export interface AlbumSummary {
    id: string,
    title: string,
    releaseDate: string,
    genre: string,
    imageUrl: string,
    artists: AlbumArtist[],
}