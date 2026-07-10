import { useAlbum } from "@/api/albums/queries";
import { useUpdateArtistInteraction } from "@/api/interactions/mutations";
import AlbumScreen from "@/components/media/albumScreen";
import type { TabRoute } from "@/types/navigation";
import { router, useLocalSearchParams, useSegments } from "expo-router";

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
