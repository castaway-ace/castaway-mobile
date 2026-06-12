import AlbumScreen from "@/components/reusable/albumScreen";
import { useLocalSearchParams } from "expo-router";

const LibraryAlbumPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <AlbumScreen id={id} />;
};

export default LibraryAlbumPage;
