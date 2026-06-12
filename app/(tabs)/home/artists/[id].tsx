import ArtistScreen from "@/components/reusable/artistScreen";
import { router, useLocalSearchParams } from "expo-router";

const HomeArtistPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const onAlbumPress = (albumId: string) => {
    router.navigate(`/(tabs)/home/albums/${albumId}`);
  };

  return <ArtistScreen id={id} onAlbumPress={onAlbumPress} />;
};

export default HomeArtistPage;
