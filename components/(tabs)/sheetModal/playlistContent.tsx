import { useAddTrackToPlaylist } from "@/api/mutations/playlists";
import { usePlaylists } from "@/api/queries/playlist";
import { useTrack } from "@/api/queries/tracks";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { blurHash } from "../../../constants/blur";
import { ThemeColors } from "../../../constants/theme";
import { useTheme } from "../../../contexts/theme-context";

interface PlaylistContent {
  trackId: string;
}

const PlaylistContent: FC<PlaylistContent> = ({ trackId }) => {
  const { data: playlists } = usePlaylists();
  const { data: track } = useTrack(trackId);

  const { mutate: addPlaylistTrack } = useAddTrackToPlaylist();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!playlists || !track) return;

  const onPlaylistPress = (id: string) => {
    addPlaylistTrack({ playlistId: id, trackId: track.id });
  };

  return (
    <View style={styles.container}>
      {playlists.map((playlist) => {
        return (
          <Pressable
            key={playlist.id}
            style={styles.spacing}
            onPress={() => onPlaylistPress(playlist.id)}
          >
            <Image
              source={{
                uri: "",
              }}
              placeholder={blurHash}
              style={styles.albumArt}
            />
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
