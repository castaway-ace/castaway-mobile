import { trackApi, TrackWithMedia } from "@/api/tracks";

export async function fetchTrackWithMedia(
  trackId: string
): Promise<TrackWithMedia> {
  try {
    // Fetch track metadata
    const track = await trackApi.getById(trackId);
    
    // Fetch album art URL
    const albumArtUrl = await trackApi.getAlbumArtUrl(track.album.id);

    const streamUrl = trackApi.getStream(trackId);

    return {
      ...track,
      streamUrl,
      albumArtUrl,
    };
  } catch (error) {
    console.error("Failed to fetch track with media:", error);
    throw error;
  }
}