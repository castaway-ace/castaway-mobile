export const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export const getAlbumCoverUrl = (albumId: string): string => {
  return `${API_BASE}/music/albums/${albumId}/cover`;
}
