import { useAlbumStar } from "@/api/albums/mutations";
import { useAlbumCover } from "@/api/albums/queries";
import { IconSymbol } from "@/components/ui/iconSymbol";
import { Skeleton } from "@/components/ui/skeleton";
import { blurHash } from "@/constants/blur";
import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { SheetType, useSheetModal } from "@/contexts/sheetModalContext";
import { useTheme } from "@/contexts/themeContext";
import { Album } from "@/types/albums";
import { formatDate } from "@/utils/formatters";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { FC, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AlbumScreenProps {
  album: Album;
  /** Navigate to an artist; supplied by the page factory so this screen stays router-free. */
  onArtistPress: (artistId: string) => void;
}

/**
 * Album detail screen: cover, title, artists, like toggle, and the track list.
 *
 * @remarks
 * Presentational — it receives the already-loaded `album` and delegates artist
 * navigation via `onArtistPress`, so the same screen backs the home, library, and
 * search album routes. Tapping a track plays the whole album from that index,
 * tagged with an `album` source; per-track overflow opens the album-track sheet.
 */
const AlbumScreen: FC<AlbumScreenProps> = ({ album, onArtistPress }) => {
  const { mutate: albumStar } = useAlbumStar();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: albumCoverUrl } = useAlbumCover(album.id);
  const { open } = useSheetModal();
  const releaseDate = formatDate(album?.releaseDate);

  const { playQueue } = useAudioPlayerContext();

  const tabBarHeight = useBottomTabBarHeight();

  const onTrackPress = (index: number) => {
    if (!album?.tracks) return;
    playQueue(album.tracks, index, { type: "album", name: album.title });
  };

  const onLikeAlbumButtonPress = () => {
    if (!album) return;
    albumStar({ id: album.id, starred: !!album.starred });
  };

  const onTrackOptionPress = (trackId: string) => {
    open({ type: SheetType.ALBUM_TRACK, id: album.id, trackId });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          // Clear the tab bar and the mini-player floating above it.
          paddingBottom: tabBarHeight + 84,
        }}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            size={32}
            name={"arrow.backward"}
            color={colors.primary}
          />
        </Pressable>
        <View style={styles.albumArtContainer}>
          <Image
            source={{
              uri: albumCoverUrl,
            }}
            placeholder={blurHash}
            style={styles.albumArt}
          />
        </View>
        <View style={styles.albumHeader}>
          <View style={styles.albumInfoContainer}>
            <Text style={styles.albumTitle}>{album?.title}</Text>
            <View>
              {album?.artists.map((artist) => {
                return (
                  <Pressable
                    key={artist.id}
                    onPress={() => onArtistPress(artist.id)}
                  >
                    <Text style={styles.artistName}>{artist.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.releaseDate}>Album • {releaseDate}</Text>
          </View>
          <Pressable onPress={onLikeAlbumButtonPress}>
            <IconSymbol
              name={album?.starred ? "heart.fill" : "heart"}
              size={48}
              color={colors.primary}
            />
          </Pressable>
        </View>
        <View style={styles.trackContainer}>
          {album?.tracks?.map((track, index) => {
            return (
              <Pressable
                key={track.id}
                style={styles.trackItem}
                onPress={() => onTrackPress(index)}
              >
                <View style={styles.trackInfo}>
                  <View style={styles.trackLeftInfo}>
                    <Text style={styles.trackTitle}>{track.title}</Text>
                    <Text style={styles.trackArtists}>
                      {track?.artists?.map((artist) => artist.name)?.join(", ")}
                    </Text>
                  </View>
                  <Pressable onPress={() => onTrackOptionPress(track.id)}>
                    <IconSymbol
                      name={"ellipsis"}
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
    backButton: {
      position: "absolute",
      left: 16,
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
    albumHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
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
      gap: 24,
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
      width: 24,
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

/** One placeholder track row: a number block beside two lines of text. */
const AlbumTrackRowSkeleton = () => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
    <Skeleton width={20} height={18} borderRadius={4} />
    <View style={{ flex: 1, gap: 6 }}>
      <Skeleton width="70%" height={16} borderRadius={4} />
      <Skeleton width="45%" height={14} borderRadius={4} />
    </View>
  </View>
);

/**
 * Loading placeholder for {@link AlbumScreen}, mirroring its layout: a large
 * centered cover, title/artist/meta lines, the like control, and a list of
 * track rows. Rendered by the album page while the album query loads, so the
 * screen doesn't pop in from blank.
 */
export const AlbumScreenSkeleton = () => {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: 16 }}
      edges={["top"]}
      testID="album-screen-skeleton"
    >
      <View style={{ paddingHorizontal: 16, gap: 24 }}>
        <View style={{ alignItems: "center" }}>
          <Skeleton width="60%" borderRadius={8} style={{ aspectRatio: 1 }} />
        </View>
        <View style={{ gap: 8 }}>
          <Skeleton width="70%" height={24} borderRadius={4} />
          <Skeleton width="45%" height={16} borderRadius={4} />
          <Skeleton width="35%" height={16} borderRadius={4} />
        </View>
        <Skeleton width={32} height={32} borderRadius={16} />
        <View style={{ gap: 16 }}>
          <Skeleton width="30%" height={18} borderRadius={4} />
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <AlbumTrackRowSkeleton key={row} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AlbumScreen;
