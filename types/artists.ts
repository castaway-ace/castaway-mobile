import { Album } from "./albums";

export interface Artist {
  id: string;
  name: string;
  imageKey: string;
  bio: string;
  albums: Album[];
}

export interface ArtistSummary {
  id: string;
  name: string;
}
