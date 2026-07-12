import ArtistScreen from "@/components/media/artistScreen";
import type { TabRoute } from "@/types/navigation";
import { router, useLocalSearchParams, useSegments } from "expo-router";

/**
 * Page factory for the artist detail route.
 *
 * @remarks
 * Reads the `id` param and builds the album-navigation callback for the
 * router-free {@link ArtistScreen}. Unlike {@link AlbumPage}, it passes `id`
 * straight through (the screen self-fetches the artist). `useSegments` keeps
 * navigation within the active tab.
 */
const ArtistPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [, tab] = useSegments() as [string, TabRoute];

  const onAlbumPress = (albumId: string) => {
    router.navigate(`/(tabs)/${tab}/albums/${albumId}`);
  };

  return <ArtistScreen id={id} onAlbumPress={onAlbumPress} />;
};

export default ArtistPage;
