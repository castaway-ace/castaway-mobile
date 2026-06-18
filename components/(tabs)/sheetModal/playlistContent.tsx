import { useAddTrackToPlaylist } from "@/api/mutations/playlists";
import { usePlaylists } from "@/api/queries/playlist";
import { useSheetModal } from "@/contexts/sheet-modal-context";
import { buildPlaylistCover } from "@/utils/playlist";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ThemeColors } from "../../../constants/theme";
import { useTheme } from "../../../contexts/theme-context";

interface PlaylistContent {
  trackId: string;
}

const PlaylistContent: FC<PlaylistContent> = ({ trackId }) => {
  const { close } = useSheetModal();
  const { data: playlistData } = usePlaylists({ onlyUser: true });

  const playlists = playlistData?.pages.flatMap((page) => page) ?? [];

  const { mutate: addPlaylistTrack } = useAddTrackToPlaylist();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!playlists) return;

  const onPlaylistPress = (id: string) => {
    addPlaylistTrack({ playlistId: id, trackId: trackId });
    close();
  };

  return (
    <View style={styles.container}>
      {playlists.map((playlist) => {
        const tiles = buildPlaylistCover(playlist?.albumCoverUrls);
        const areTilesPresent = tiles.length > 0;

        return (
          <Pressable
            key={playlist.id}
            style={styles.spacing}
            onPress={() => onPlaylistPress(playlist.id)}
          >
            <View style={styles.albumArt}>
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
            <View style={styles.trackLeftInfo}>
              <Text style={styles.trackTitle}>{playlist.name}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    trackInfo: {
      borderBottomWidth: 1,
      borderColor: colors.primary,
    },
    spacing: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      padding: 16,
    },
    albumArt: {
      width: 60,
      height: 60,
      borderRadius: 16,
    },
    playlistFullArt: {
      width: "100%",
      height: "100%",
    },
    playlistMiniArt: {
      width: "50%",
      height: "50%",
    },
    trackLeftInfo: {
      display: "flex",
      gap: 4,
    },
    trackTitle: {
      color: colors.primary,
      fontSize: 18,
    },
    trackArtists: {
      color: colors.secondary,
      fontSize: 16,
    },
    bottomContainer: {
      padding: 16,
      gap: 24,
    },
    bottomButton: {
      flexDirection: "row",
      gap: 16,
      alignItems: "center",
    },
    text: {
      color: colors.primary,
      fontSize: 16,
    },
  });

export default PlaylistContent;
