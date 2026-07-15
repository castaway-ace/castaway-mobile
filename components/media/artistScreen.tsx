import { useArtistStar } from "@/api/artists/mutations";
import { useArtist, useArtistImage } from "@/api/artists/queries";
import { IconSymbol } from "@/components/ui/iconSymbol";
import { Skeleton } from "@/components/ui/skeleton";
import { blurHash } from "@/constants/blur";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { Artist } from "@/types/artists";
import { presignedImageSource } from "@/utils/images";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { FC, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AlbumItem from "./albumItem";
import { AlbumItemSkeleton, SkeletonShelf } from "./skeletons";

interface ArtistScreenProps {
  id: string;
  /** Navigate to an album; supplied by the page factory so this screen stays router-free. */
  onAlbumPress: (albumId: string) => void;
}

// White regardless of theme: the back button sits over the artist image (an
// arbitrary photo), so it's paired with a dark scrim for legibility rather than
// tinted to the UI theme — same rationale as the contrast palette in
// utils/contrast.ts.
const ON_IMAGE_ICON = "#FFFFFF";

/**
 * Artist detail screen: a full-bleed hero image, name, like toggle, and a
 * horizontal carousel of the artist's albums.
 *
 * @remarks
 * Self-fetches from `id` (unlike {@link AlbumScreen}, which is handed its entity)
 * and delegates album navigation via `onAlbumPress`, so it backs the artist
 * routes across all three tabs. The hero image bleeds edge-to-edge and up under
 * the status bar with the back button floating over it; the album row mirrors the
 * home screen's shelves, reusing the shared {@link AlbumItem} card.
 */
const ArtistScreen: FC<ArtistScreenProps> = ({ id, onAlbumPress }) => {
  const { data: artist, isLoading } = useArtist(id);

  const { data: artistImageUrl, isPending: isImagePending } =
    useArtistImage(id);

  // Gate the content behind loading: `ArtistScreenContent` owns the scroll ref
  // and `useScrollOffset`, so keeping it unmounted until the ScrollView actually
  // renders avoids reanimated warning that the animated ref isn't yet attached.
  if (isLoading) return <ArtistScreenSkeleton />;

  return (
    <ArtistScreenContent
      id={id}
      artist={artist}
      artistImageUrl={artistImageUrl}
      isImagePending={isImagePending}
      onAlbumPress={onAlbumPress}
    />
  );
};

interface ArtistScreenContentProps extends ArtistScreenProps {
  /** The loaded artist; may be `undefined` if the fetch resolved without data. */
  artist: Artist | undefined;
  /** The artist's photo URL; `undefined` while in flight or if they have none. */
  artistImageUrl: string | undefined;
  /** Whether the photo URL is still in flight, distinguishing it from "no photo". */
  isImagePending: boolean;
}

/**
 * The loaded artist screen: hero, name/like row, and album carousel.
 *
 * @remarks
 * Split out from {@link ArtistScreen} so the stretchy-header machinery — the
 * animated scroll ref and {@link useScrollOffset} — only mounts once there's a
 * real {@link Animated.ScrollView} for the ref to attach to.
 */
const ArtistScreenContent: FC<ArtistScreenContentProps> = ({
  artist,
  artistImageUrl,
  isImagePending,
  onAlbumPress,
}) => {
  const { mutate } = useArtistStar();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  // Concrete pixel height for the hero (a 4:3 aspect ratio applied to the
  // screen width), needed to drive the scroll interpolation below.
  const { width } = useWindowDimensions();
  const heroHeight = (width * 3) / 4;

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

  // Stretchy header: a pull-down (negative offset, iOS rubber-band) grows the
  // image to fill the exposed gap with its top pinned to the screen edge; a
  // scroll up drifts it away at 0.75× for a subtle parallax. The scale/translate
  // pair is the standard reanimated stretchy-header formula — at full pull the
  // −heroHeight/2 translate cancels the center-anchored scale so the top holds.
  const heroAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [-heroHeight, 0, heroHeight],
          [-heroHeight / 2, 0, heroHeight * 0.75],
        ),
      },
      {
        scale: interpolate(
          scrollOffset.value,
          [-heroHeight, 0, heroHeight],
          [2, 1, 1],
        ),
      },
    ],
  }));

  const onLikeButtonPress = () => {
    if (!artist) return;
    mutate({ id: artist.id, starred: !!artist?.starred });
  };
  const imageSource = artistImageUrl
    ? presignedImageSource(artistImageUrl)
    : isImagePending
      ? undefined
      : require("../../assets/placeholders/artist-placeholder.png");

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          // Clear the tab bar and the mini-player floating above it.
          paddingBottom: tabBarHeight + 84,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.hero, heroAnimatedStyle]}>
          <Image
            source={imageSource}
            placeholder={blurHash}
            // expo-image defaults to `disk`, which re-reads and re-decodes this
            // full-bleed photo on every visit to the screen; keeping it in memory
            // too makes a return trip immediate. Falls back to disk when the
            // memory cache is purged.
            cachePolicy="memory-disk"
            contentFit="cover"
            // Anchor to the top rather than cover's default center: artist photos
            // are portraits framing the face in the upper half, so a center crop
            // into the 4:3 hero eats into it. Pinning the top pushes the whole
            // overflow to the bottom of the photo instead.
            contentPosition="top"
            style={[styles.artistImage, { height: heroHeight }]}
          />
        </Animated.View>
        <View style={styles.scrollingContent}>
          <View style={styles.body}>
            <View style={styles.artistInfoContainer}>
              <Text style={styles.artistTitle} numberOfLines={1}>
                {artist?.name}
              </Text>
              <Pressable onPress={onLikeButtonPress}>
                <IconSymbol
                  name={artist?.starred ? "heart.fill" : "heart"}
                  size={40}
                  color={colors.primary}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.albumSection}>
            <Text style={styles.albumHeader}>Albums</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.albumScrollContent}
            >
              {artist?.albums?.map((album) => (
                <Pressable
                  key={album.id}
                  onPress={() => onAlbumPress(album.id)}
                >
                  <AlbumItem id={album.id} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Fixed over the hero, outside the scroll view so it neither scales with
          the stretch nor scrolls away with the content. */}
      <Pressable
        style={[styles.backButton, { top: insets.top + 8 }]}
        onPress={() => router.back()}
      >
        <IconSymbol size={24} name={"arrow.backward"} color={ON_IMAGE_ICON} />
      </Pressable>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    hero: {
      width: "100%",
    },
    artistImage: {
      width: "100%",
    },
    scrollingContent: {
      backgroundColor: colors.background,
      paddingTop: 20,
    },
    backButton: {
      position: "absolute",
      left: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.overlay,
    },
    body: {
      paddingHorizontal: 16,
    },
    artistInfoContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 24,
    },
    artistTitle: {
      flex: 1,
      color: colors.primary,
      fontSize: 32,
      fontWeight: "600",
    },
    albumSection: {
      gap: 16,
    },
    albumHeader: {
      color: colors.primary,
      fontSize: 24,
      fontWeight: "500",
      paddingHorizontal: 16,
    },
    albumScrollContent: {
      flexDirection: "row",
      gap: 16,
      paddingHorizontal: 16,
    },
  });

/**
 * Loading placeholder for {@link ArtistScreen}: a full-bleed hero image, the name
 * line, and a horizontal shelf of album-card placeholders. Reuses
 * {@link SkeletonShelf} / {@link AlbumItemSkeleton} so the album row matches.
 */
export const ArtistScreenSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background }}
      testID="artist-screen-skeleton"
    >
      <Skeleton width="100%" borderRadius={0} style={{ aspectRatio: 1 }} />
      <View style={{ paddingHorizontal: 16, marginTop: 20, marginBottom: 24 }}>
        <Skeleton width="50%" height={32} borderRadius={4} />
      </View>
      <SkeletonShelf>
        {[0, 1, 2].map((i) => (
          <AlbumItemSkeleton key={i} />
        ))}
      </SkeletonShelf>
    </View>
  );
};

export default ArtistScreen;
