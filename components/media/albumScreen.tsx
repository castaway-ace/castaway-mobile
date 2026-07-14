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
import { FC, useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AlbumScreenProps {
  album: Album;
  /** Navigate to an artist; supplied by the page factory so this screen stays router-free. */
  onArtistPress: (artistId: string) => void;
}

/** Height of the sticky header's content row, below the status-bar inset. */
const HEADER_CONTENT_HEIGHT = 48;

/** Width reserved for the back button, mirrored as a spacer to center the title. */
const HEADER_BUTTON_WIDTH = 32;

/**
 * Scroll distance over which the sticky header crossfades, ending the moment the
 * album title is fully hidden. The fade tracks the title's approach rather than
 * snapping at the threshold.
 */
const HEADER_FADE_DISTANCE = 64;

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
  const insets = useSafeAreaInsets();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

  // Where the sticky header's bottom edge sits, and where scroll content starts.
  const headerBottom = insets.top + HEADER_CONTENT_HEIGHT;

  // The title's position is measured rather than hardcoded: a long album title
  // wraps to a second line, which moves the point where it slips under the
  // header. `headerRowY` is relative to the scroll content (it's a direct child
  // of the content container) and `titleBottom` is relative to that row, so the
  // two sum to the title's bottom edge in scroll-content coordinates.
  const [headerRowY, setHeaderRowY] = useState(0);
  const [titleBottom, setTitleBottom] = useState(0);

  const onHeaderRowLayout = (event: LayoutChangeEvent) =>
    setHeaderRowY(event.nativeEvent.layout.y);

  const onAlbumTitleLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setTitleBottom(y + height);
  };

  // Scroll offset past which the album title is fully hidden behind the header.
  // Stays negative until both layouts have reported, which reads as "not
  // measured yet" and keeps the header hidden on first paint.
  const revealOffset = headerRowY + titleBottom - headerBottom;

  // Fade the background and title in as the album title nears the header, landing
  // at full opacity exactly as it disappears behind it. Driving opacity straight
  // from the scroll position (rather than a timed animation off a threshold) ties
  // the crossfade to the user's finger and reverses it on the way back up.
  const stickyHeaderStyle = useAnimatedStyle(() => {
    // Negative until both onLayouts have reported; without this the clamp below
    // would read a scroll of 0 as "past the threshold" and flash the header.
    if (revealOffset <= 0) return { opacity: 0 };
    return {
      opacity: interpolate(
        scrollOffset.value,
        [revealOffset - HEADER_FADE_DISTANCE, revealOffset],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

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
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          paddingHorizontal: 16,
          // Start below the sticky header, which floats over the scroll view.
          paddingTop: headerBottom,
          // Clear the tab bar and the mini-player floating above it.
          paddingBottom: tabBarHeight + 84,
        }}
      >
        <View style={styles.albumArtContainer}>
          <Image
            source={{
              uri: albumCoverUrl,
            }}
            placeholder={blurHash}
            style={styles.albumArt}
          />
        </View>
        <View style={styles.albumHeader} onLayout={onHeaderRowLayout}>
          <View style={styles.albumInfoContainer}>
            <Text style={styles.albumTitle} onLayout={onAlbumTitleLayout}>
              {album?.title}
            </Text>
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
              size={40}
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
                    <Text style={styles.trackTitle} numberOfLines={1}>
                      {track.title}
                    </Text>
                    <Text style={styles.trackArtists} numberOfLines={1}>
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
      </Animated.ScrollView>

      {/* Fixed over the scroll view so the back button is always reachable. Only
          the background and title fade in; box-none lets touches through the
          header's empty space to the content underneath. */}
      <View
        style={[
          styles.stickyHeader,
          { paddingTop: insets.top, height: headerBottom },
        ]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.stickyHeaderBackground,
            stickyHeaderStyle,
          ]}
        />
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            size={32}
            name={"arrow.backward"}
            color={colors.primary}
          />
        </Pressable>
        <Animated.Text
          style={[styles.stickyHeaderTitle, stickyHeaderStyle]}
          numberOfLines={1}
          testID="album-sticky-header-title"
        >
          {album?.title}
        </Animated.Text>
        {/* Mirrors the back button's width so the flexed title centers against
            the screen rather than the space left over beside the button. */}
        <View style={styles.headerSpacer} />
      </View>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    stickyHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      gap: 12,
    },
    stickyHeaderBackground: {
      backgroundColor: colors.surface,
    },
    stickyHeaderTitle: {
      flex: 1,
      textAlign: "center",
      color: colors.primary,
      fontSize: 18,
      fontWeight: 600,
    },
    backButton: {
      width: HEADER_BUTTON_WIDTH,
      justifyContent: "center",
    },
    headerSpacer: {
      width: HEADER_BUTTON_WIDTH,
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
      gap: 12,
    },
    trackLeftInfo: {
      flex: 1,
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
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + HEADER_CONTENT_HEIGHT,
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
