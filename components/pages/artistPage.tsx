import ArtistScreen from "@/components/media/artistScreen";
import type { TabRoute } from "@/types/navigation";
import { router, useLocalSearchParams, useSegments } from "expo-router";

const ArtistPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [, tab] = useSegments() as [string, TabRoute];

  const onAlbumPress = (albumId: string) => {
    router.navigate(`/(tabs)/${tab}/albums/${albumId}`);
  };

  return <ArtistScreen id={id} onAlbumPress={onAlbumPress} />;
};

export default ArtistPage;
