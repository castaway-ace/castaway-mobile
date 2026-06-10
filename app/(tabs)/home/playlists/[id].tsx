import ArtistScreen from "@/components/reusable/artistScreen";
import { useLocalSearchParams } from "expo-router";

const HomeAlbumPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ArtistScreen id={id} />;
};

export default HomeAlbumPage;
