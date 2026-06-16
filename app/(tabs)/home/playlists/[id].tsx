import { useLocalSearchParams } from "expo-router";
import PlaylistScreen from "../../../../components/(tabs)/reusable/playlistScreen";

const HomePlaylistPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <PlaylistScreen id={id} />;
};

export default HomePlaylistPage;
