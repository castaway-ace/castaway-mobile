import { usePlaylist } from "@/api/playlists/queries";
import { PlaylistItemSkeleton } from "@/components/media/skeletons";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import PlaylistCover from "./playlistCover";

interface PlaylistItemProps {
  id: string;
}

/**
 * Playlist card (tiled cover, name) for playlist shelves.
 *
 * @remarks
 * Self-fetching from `id`, like the other media cards. Delegates artwork to
 * {@link PlaylistCover}, which turns the playlist's album covers into a single
 * image or 2x2 grid.
 */
const PlaylistItem: FC<PlaylistItemProps> = ({ id }) => {
  const { colors } = useTheme();
  const { data: playlist, isLoading } = usePlaylist(id);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (isLoading) return <PlaylistItemSkeleton />;

  return (
    <View style={styles.playlistContainer}>
      <PlaylistCover urls={playlist?.albumCoverUrls} style={styles.playlistArt} />
      <Text style={styles.playlistName}>{playlist?.name}</Text>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    playlistContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    playlistArt: {
      width: 160,
      height: 160,
      borderRadius: 12,
    },
    playlistName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
    },
  });

export default PlaylistItem;
