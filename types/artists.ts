import { Album } from "./albums";

export interface Artist {
  id: string;
  name: string;
  imageKey: string;
  bio: string;
  albums: Album[];
  starred: boolean;
}

export interface ArtistSummary {
  id: string;
  name: string;
}
