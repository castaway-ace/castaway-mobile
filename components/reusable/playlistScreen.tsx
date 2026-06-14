import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { useTheme } from "@/contexts/theme-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { FC, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTrackStar } from "../../api/mutations/tracks";
import { usePlaylist } from "../../api/queries/playlist";
import { useStarredTracks } from "../../api/queries/tracks";
import { IconSymbol } from "../ui/icon-symbol";

interface PlaylistScreenProps {
  id: string;
}

const PlaylistScreen: FC<PlaylistScreenProps> = ({ id }) => {
  const { data: playlist } = usePlaylist(id);
  const { data: starredTracks } = useStarredTracks();
  const { mutate: trackStar } = useTrackStar();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { playQueue } = useAudioPlayerContext();

  const tabBarHeight = useBottomTabBarHeight();

  const onTrackPress = (index: number) => {
    if (!playlist?.tracks) return;
    playQueue(playlist.tracks, index);
  };

  const onLikeTrackButtonPress = (trackId: string, starred: boolean) => {
    trackStar({ id: trackId, starred: !!starred });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: tabBarHeight + 84,
        }}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol size={32} name={"chevron.left"} color={colors.primary} />
        </Pressable>
        <View style={styles.playlistArtContainer}>
          <Image
            source={require("../../assets/placeholders/album-placeholder.png")}
            style={styles.playlistArt}
          />
        </View>
        <View style={styles.playlistInfoContainer}>
          <Text style={styles.playlistTitle}>{playlist?.name}</Text>
        </View>
        <View style={styles.trackContainer}>
          <Text style={styles.trackHeader}>Tracks</Text>
          {playlist?.tracks?.map((track, index) => {
            const starred = !!starredTracks?.includes(track.id);
            return (
              <Pressable
                key={track.id}
                style={styles.trackItem}
                onPress={() => onTrackPress(index)}
              >
                <Text style={styles.trackNumber}>{track.trackNumber}</Text>
                <View style={styles.trackInfo}>
                  <View style={styles.trackLeftInfo}>
                    <Text style={styles.trackTitle}>{track.title}</Text>
                    <Text style={styles.trackArtists}>
                      {track?.artists?.map((artist) => artist.name)?.join(", ")}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => onLikeTrackButtonPress(track.id, starred)}
                  >
                    <IconSymbol
                      name={starred ? "heart.fill" : "heart"}
                      size={32}
                      color={colors.primary}
                    />
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 16,
    },
    scrollContainer: {
      paddingHorizontal: 16,
    },
    backButton: {
      position: "absolute",
      left: 4,
    },
    playlistArtContainer: {
      display: "flex",
      alignItems: "center",
      marginBottom: 24,
    },
    playlistArt: {
      width: "60%",
      aspectRatio: 800 / 800,
      borderRadius: 8,
    },
    playlistInfoContainer: {
      display: "flex",
      gap: 8,
      marginBottom: 24,
    },
    playlistTitle: {
      color: colors.primary,
      fontSize: 22,
      fontWeight: 500,
    },
    artistName: {
      color: colors.primary,
      fontSize: 16,
    },
    releaseDate: {
      color: colors.secondary,
      fontSize: 16,
    },
    trackContainer: {
      display: "flex",
      gap: 16,
    },
    trackHeader: {
      color: colors.primary,
      fontSize: 18,
    },
    trackItem: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    trackNumber: {
      color: colors.primary,
      fontSize: 18,
    },
    trackInfo: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
  });

export default PlaylistScreen;
