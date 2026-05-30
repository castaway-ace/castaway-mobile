import { Track } from "./tracks";

export interface Playlist {
    id: string;
    name: string;
    description: string;
    public: boolean
    position: number;
    tracks: Track[];
  }
  