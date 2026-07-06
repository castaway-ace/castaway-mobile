import { useAlbum } from "@/api/albums/queries";
import { useUpdateArtistInteraction } from "@/api/interactions/mutations";
import AlbumScreen from "@/components/media/albumScreen";
import { router, useLocalSearchParams } from "expo-router";

export type TabRoute = "home" | "library" | "search";

export const createAlbumPage = (tab: TabRoute) => {
  const AlbumPage = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: album } = useAlbum(id);
    const { mutate: artistInteraction } = useUpdateArtistInteraction();

    if (!album) return null;

    const onArtistPress = (artistId: string) => {
      artistInteraction(artistId);
      router.navigate(`/(tabs)/${tab}/artists/${artistId}`);
    };

    return <AlbumScreen album={album} onArtistPress={onArtistPress} />;
  };

  return AlbumPage;
};
