import { usePlaylist } from "@/api/queries/playlist";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { buildPlaylistCover } from "@/utils/playlist";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface PlaylistItemProps {
  id: string;
}

const PlaylistItem: FC<PlaylistItemProps> = ({ id }) => {
  const { colors } = useTheme();
  const { data: playlist } = usePlaylist(id);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const tiles = buildPlaylistCover(playlist?.albumCoverUrls);

  const areTilesPresent = tiles.length > 0;

  return (
    <View style={styles.playlistContainer}>
      {!areTilesPresent && (
        <Image
          source={require("../../../assets/placeholders/album-placeholder.png")}
          style={styles.playlistArt}
        />
      )}
      {areTilesPresent && (
        <View style={styles.playlistArt}>
          {tiles.map((url, index) => {
            return (
              <Image
                key={`${url}-${index}`}
                source={{ uri: url }}
                style={
                  tiles.length === 1
                    ? styles.playlistFullArt
                    : styles.playlistMiniArt
                }
              />
            );
          })}
        </View>
      )}
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
      flexDirection: "row",
      flexWrap: "wrap",
      overflow: "hidden",
    },
    playlistFullArt: {
      width: "100%",
      height: "100%",
    },
    playlistMiniArt: {
      width: "50%",
      height: "50%",
    },
    playlistName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
    },
  });

export default PlaylistItem;
