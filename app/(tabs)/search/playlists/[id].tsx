import { useLocalSearchParams } from "expo-router";
import PlaylistScreen from "../../../../components/(tabs)/reusable/playlistScreen";

const SearchPlaylistPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <PlaylistScreen id={id} />;
};

export default SearchPlaylistPage;
