import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { Playlist } from "@/types/playlist";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface PlaylistProps {
  playlist: Playlist;
}

const PlaylistItem: FC<PlaylistProps> = ({ playlist }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.playlistContainer}>
      <Image
        source={{
          uri: "",
        }}
        style={styles.playlistArt}
      />
      <Text style={styles.playlistName}>{playlist.name}</Text>
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
      borderRadius: 8,
      backgroundColor: "white",
    },
    playlistName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
    },
  });

export default PlaylistItem;
