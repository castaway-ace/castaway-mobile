import { useAlbum, useAlbumCover } from "@/api/queries/albums";
import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { useTheme } from "@/contexts/theme-context";
import { formatDate } from "@/utils/formatters";
import { Image } from "expo-image";
import { router } from "expo-router";
import { FC, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "../ui/icon-symbol";

interface AlbumScreenProps {
  id: string;
}

const AlbumScreen: FC<AlbumScreenProps> = ({ id }) => {
  const { data: album } = useAlbum(id);

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: albumCoverUrl } = useAlbumCover(id);
  const releaseDate = formatDate(album?.releaseDate);

  const { playQueue } = useAudioPlayerContext();

  const onTrackPress = (index: number) => {
    if (!album?.tracks) return;
    playQueue(album.tracks, index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol size={20} name={"chevron.left"} color={colors.primary} />
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
          {album?.tracks?.map((track, index) => {
            return (
              <Pressable
                key={track.id}
                style={styles.trackItem}
                onPress={() => onTrackPress(index)}
              >
                <Text style={styles.trackTitle}>{track.title}</Text>
                <Text style={styles.trackArtists}>{album?.artists}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.bottomSpacing}></View>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      paddingHorizontal: 16,
    },
    backButton: {
      position: "absolute",
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
    trackItem: {
      display: "flex",
      gap: 8,
    },
    trackTitle: {
      color: colors.primary,
      fontSize: 18,
    },
    trackArtists: {
      color: colors.secondary,
      fontSize: 16,
    },
    bottomSpacing: {
      height: 140,
    },
  });

export default AlbumScreen;
