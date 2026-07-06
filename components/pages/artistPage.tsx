import ArtistScreen from "@/components/media/artistScreen";
import type { TabRoute } from "@/components/pages/albumPage";
import { router, useLocalSearchParams } from "expo-router";

export const createArtistPage = (tab: TabRoute) => {
  const ArtistPage = () => {
    const { id } = useLocalSearchParams<{ id: string }>();

    const onAlbumPress = (albumId: string) => {
      router.navigate(`/(tabs)/${tab}/albums/${albumId}`);
    };

    return <ArtistScreen id={id} onAlbumPress={onAlbumPress} />;
  };

  return ArtistPage;
};
