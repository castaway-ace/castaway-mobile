import { AlbumSummary } from "./albums";
import { ArtistSummary } from "./artists";
import { TrackSummary } from "./tracks";

export interface Search {
    tracks: TrackSummary[]
    albums: AlbumSummary[]
    artists: ArtistSummary[]
}