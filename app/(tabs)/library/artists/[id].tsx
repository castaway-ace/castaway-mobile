import ArtistScreen from "@/components/(tabs)/reusable/artistScreen";
import { router, useLocalSearchParams } from "expo-router";

const LibraryArtistPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const onAlbumPress = (albumId: string) => {
    router.navigate(`/(tabs)/library/albums/${albumId}`);
  };

  return <ArtistScreen id={id} onAlbumPress={onAlbumPress} />;
};

export default LibraryArtistPage;
