import { useAlbumStar } from "@/api/albums/mutations";
import { useAlbumCover } from "@/api/albums/queries";
import TrackRow from "@/components/media/trackRow";
import {
  STICKY_HEADER_CONTENT_HEIGHT,
  StickyHeader,
  useStickyHeaderReveal,
} from "@/components/navigation/stickyHeader";
import { IconSymbol } from "@/components/ui/iconSymbol";
import { Skeleton } from "@/components/ui/skeleton";
import { blurHash } from "@/constants/blur";
import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import {
  CONTENT_BOTTOM_GAP,
  useBottomInset,
} from "@/contexts/bottomInsetContext";
import { SheetType, useSheetModal } from "@/contexts/sheetModalContext";
import { useTheme } from "@/contexts/themeContext";
import { Album } from "@/types/albums";
import { groupTracksByDisc } from "@/utils/albums";
import { isVariousArtists } from "@/utils/artists";
import { formatDate } from "@/utils/formatters";
import { presignedImageSource } from "@/utils/images";
import { Image } from "expo-image";
import { router } from "expo-router";
import { FC, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
 * That same source tag is what lets the list mark the playing track, but only
 * while this album is the thing being played.
 */
const AlbumScreen: FC<AlbumScreenProps> = ({ album, onArtistPress }) => {
  const { mutate: albumStar } = useAlbumStar();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: albumCoverUrl } = useAlbumCover(album.id);
  const { open } = useSheetModal();
  const releaseDate = formatDate(album?.releaseDate);

  const { playQueue, currentTrack, isPlaying, source } =
    useAudioPlayerContext();

  // Only mark a track here if *this* album is what's playing. A track played
  // from a playlist belongs to that playlist's page, even though the same track
  // also sits in this list.
  const isPlayingThisAlbum = source?.type === "album" && source.id === album.id;

  // Split the flat track list into disc sections; each row keeps its original
  // index into `album.tracks` so playback still starts on the right track.
  const discGroups = useMemo(
    () => groupTracksByDisc(album.tracks ?? []),
    [album.tracks],
  );
  const showDiscHeaders = discGroups.length > 1;

  const { bottomInset } = useBottomInset();

  const {
    scrollRef,
    headerBottom,
    onHeaderRowLayout,
    onTitleLayout,
    headerStyle,
  } = useStickyHeaderReveal();

  const onTrackPress = (index: number) => {
    if (!album?.tracks) return;
    playQueue(album.tracks, index, {
      type: "album",
      id: album.id,
      name: album.title,
    });
  };

  const onLikeAlbumButtonPress = () => {
    if (!album) return;
    albumStar({ id: album.id, starred: !!album.starred });
  };

  const onTrackOptionPress = (trackId: string) => {
    open({ type: SheetType.ALBUM_TRACK, id: album.id, trackId });
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          paddingHorizontal: 16,
          // Start below the sticky header, which floats over the scroll view.
          paddingTop: headerBottom,
          paddingBottom: bottomInset + CONTENT_BOTTOM_GAP,
        }}
      >
        <View style={styles.albumArtContainer}>
          <Image
            source={
              albumCoverUrl ? presignedImageSource(albumCoverUrl) : undefined
            }
            placeholder={blurHash}
            style={styles.albumArt}
          />
        </View>
        <View style={styles.albumHeader} onLayout={onHeaderRowLayout}>
          <View style={styles.albumInfoContainer}>
            <Text style={styles.albumTitle} onLayout={onTitleLayout}>
              {album?.title}
            </Text>
            <View>
              {album?.artists.map((artist) => {
                if (isVariousArtists(artist)) {
                  return (
                    <Text key={artist.id} style={styles.artistName}>
                      {artist.name}
                    </Text>
                  );
                }
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
              size={40}
              color={colors.primary}
            />
          </Pressable>
        </View>
        <View style={styles.trackContainer}>
          {discGroups.map((group) => (
            <View key={group.discNumber} style={styles.discSection}>
              {showDiscHeaders && (
                <View style={styles.discMiniSection}>
                  <IconSymbol
                    size={28}
                    name={"opticaldisc.fill"}
                    color={colors.primary}
                  />
                  <Text style={styles.discLabel}>Disc {group.discNumber}</Text>
                </View>
              )}
              {group.tracks.map(({ track, index }) => (
                <TrackRow
                  key={track.id}
                  title={track.title}
                  artists={track.artists}
                  isActive={isPlayingThisAlbum && currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  onPress={() => onTrackPress(index)}
                  onOptionsPress={() => onTrackOptionPress(track.id)}
                />
              ))}
            </View>
          ))}
        </View>
      </Animated.ScrollView>

      <StickyHeader
        title={album?.title}
        headerStyle={headerStyle}
        onBack={() => router.back()}
      />
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      flex: 1,
      display: "flex",
      gap: 8,
      marginBottom: 24,
    },
    albumHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    albumTitle: {
      color: colors.primary,
      fontSize: 22,
      fontWeight: 600,
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
      gap: 32,
    },
    discSection: {
      display: "flex",
      gap: 24,
    },
    discMiniSection: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    discLabel: {
      color: colors.secondary,
      fontSize: 16,
      fontWeight: 600,
      letterSpacing: 0.5,
      textTransform: "uppercase",
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
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + STICKY_HEADER_CONTENT_HEIGHT,
      }}
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
    </View>
  );
};

export default AlbumScreen;
