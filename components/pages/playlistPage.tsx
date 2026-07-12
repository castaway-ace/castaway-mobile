import PlaylistScreen from "@/components/media/playlistScreen";
import { useLocalSearchParams } from "expo-router";

/**
 * Page factory for the playlist detail route.
 *
 * @remarks
 * Bridges Expo Router and the presentational {@link PlaylistScreen}: it reads
 * the `id` route param here so the screen stays a plain, prop-driven component
 * that's trivial to render in isolation (tests, storybook) without a router.
 * The same factory backs the home, library, and search copies of the route.
 */
const PlaylistPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlaylistScreen id={id} />;
};

export default PlaylistPage;
