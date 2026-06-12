import AlbumScreen from "@/components/reusable/albumScreen";
import { useLocalSearchParams } from "expo-router";

const SearchAlbumPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <AlbumScreen id={id} />;
};

export default SearchAlbumPage;
