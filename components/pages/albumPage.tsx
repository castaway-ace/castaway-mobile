import { useAlbum } from "@/api/albums/queries";
import { useUpdateArtistInteraction } from "@/api/interactions/mutations";
import AlbumScreen from "@/components/media/albumScreen";
import type { TabRoute } from "@/types/navigation";
import { router, useLocalSearchParams, useSegments } from "expo-router";

/**
 * Page factory for the album detail route.
 *
 * @remarks
 * Bridges the router to the presentational {@link AlbumScreen}: it reads the `id`
 * param, fetches the album, and builds the artist-navigation callback so the
 * screen stays router-free. `useSegments` recovers the current tab so navigation
 * stays within it (home/library/search), and the artist interaction is recorded
 * before routing. Renders nothing until the album loads, since the screen
 * requires a non-null album.
 */
const AlbumPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [, tab] = useSegments() as [string, TabRoute];
  const { data: album } = useAlbum(id);
  const { mutate: artistInteraction } = useUpdateArtistInteraction();

  if (!album) return null;

  const onArtistPress = (artistId: string) => {
    artistInteraction(artistId);
    router.navigate(`/(tabs)/${tab}/artists/${artistId}`);
  };

  return <AlbumScreen album={album} onArtistPress={onArtistPress} />;
};

export default AlbumPage;
