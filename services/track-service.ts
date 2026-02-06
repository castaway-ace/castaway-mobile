import { trackApi } from "@/api/tracks";
import { TrackWithMedia } from "@/types/tracks";

export async function fetchTrackWithMedia(
  trackId: string
): Promise<TrackWithMedia> {
  try {
    const track = await trackApi.getById(trackId);
    
    const albumArt = await trackApi.getAlbumArt(track.album.id);

    const stream = await trackApi.getStream(trackId);

    return {
      ...track,
      stream,
      albumArt,
    };
  } catch (error) {
    console.error("Failed to fetch track with media:", error);
    throw error;
  }
}