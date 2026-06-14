import AlbumScreen from "@/components/reusable/albumScreen";
import { router, useLocalSearchParams } from "expo-router";
import { useUpdateArtistInteraction } from "../../../../api/mutations/interactions";
import { useAlbum } from "../../../../api/queries/albums";

const HomeAlbumPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: album } = useAlbum(id);
  const { mutate: artistInteraction } = useUpdateArtistInteraction();

  if (!album) return;

  const onArtistPress = (artistId: string) => {
    artistInteraction(artistId);
    router.navigate(`/(tabs)/home/artists/${artistId}`);
  };

  return <AlbumScreen album={album} onArtistPress={onArtistPress} />;
};

export default HomeAlbumPage;
