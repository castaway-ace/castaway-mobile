import PlaylistScreen from "@/components/media/playlistScreen";
import { useLocalSearchParams } from "expo-router";

const PlaylistPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlaylistScreen id={id} />;
};

export default PlaylistPage;
