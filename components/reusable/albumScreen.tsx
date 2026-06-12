import { useAlbum, useAlbumCover } from "@/api/queries/albums";
import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { useTheme } from "@/contexts/theme-context";
import { formatDate } from "@/utils/formatters";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { FC, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTrackStar } from "../../api/mutations/tracks";
import { IconSymbol } from "../ui/icon-symbol";

interface AlbumScreenProps {
  id: string;
}

const AlbumScreen: FC<AlbumScreenProps> = ({ id }) => {
  const { data: album } = useAlbum(id);
  const { mutate } = useTrackStar();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: albumCoverUrl } = useAlbumCover(id);
  const releaseDate = formatDate(album?.releaseDate);

  const { playQueue } = useAudioPlayerContext();

  const tabBarHeight = useBottomTabBarHeight();

  const onTrackPress = (index: number) => {
    if (!album?.tracks) return;
    playQueue(album.tracks, index);
  };

  const onLikeButtonPress = (trackId: string, starred: boolean) => {
    mutate({ id: trackId, starred: !!starred });
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
        <View style={styles.albumArtContainer}>
          <Image
            source={{
              uri: albumCoverUrl,
            }}
            style={styles.albumArt}
          />
        </View>
        <View style={styles.albumInfoContainer}>
          <Text style={styles.albumTitle}>{album?.title}</Text>
          <Text style={styles.artistName}>{album?.artists}</Text>
          <Text style={styles.releaseDate}>{releaseDate}</Text>
        </View>
        <View style={styles.trackContainer}>
          <Text style={styles.trackHeader}>Tracks</Text>
          {album?.tracks?.map((track, index) => {
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
                    <Text style={styles.trackArtists}>{album?.artists}</Text>
                  </View>
                  <Pressable
                    onPress={() => onLikeButtonPress(track.id, track.starred)}
                  >
                    <IconSymbol
                      name={track?.starred ? "heart.fill" : "heart"}
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
    albumArtContainer: {
      display: "flex",
      alignItems: "center",
      marginBottom: 24,
    },
    albumArt: {
      width: "60%",
      aspectRatio: 800 / 800,
      borderRadius: 8,
    },
    albumInfoContainer: {
      display: "flex",
      gap: 8,
      marginBottom: 24,
    },
    albumTitle: {
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

export default AlbumScreen;
