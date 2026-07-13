import { useAlbum } from "@/api/albums/queries";
import { useUpdateArtistInteraction } from "@/api/interactions/mutations";
import AlbumScreen, { AlbumScreenSkeleton } from "@/components/media/albumScreen";
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
 * before routing. Because {@link AlbumScreen} requires a non-null album, the page
 * shows {@link AlbumScreenSkeleton} while the query loads and renders nothing on
 * error/empty.
 */
const AlbumPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [, tab] = useSegments() as [string, TabRoute];
  const { data: album, isLoading } = useAlbum(id);
  const { mutate: artistInteraction } = useUpdateArtistInteraction();

  if (isLoading) return <AlbumScreenSkeleton />;
  if (!album) return null;

  const onArtistPress = (artistId: string) => {
    artistInteraction(artistId);
    router.navigate(`/(tabs)/${tab}/artists/${artistId}`);
  };

  return <AlbumScreen album={album} onArtistPress={onArtistPress} />;
};

export default AlbumPage;
