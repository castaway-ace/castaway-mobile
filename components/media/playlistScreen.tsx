import { usePlaylist, usePlaylistTracks } from "@/api/playlists/queries";
import {
  STICKY_HEADER_CONTENT_HEIGHT,
  StickyHeader,
  useStickyHeaderReveal,
} from "@/components/navigation/stickyHeader";
import { IconSymbol } from "@/components/ui/iconSymbol";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { SheetType, useSheetModal } from "@/contexts/sheetModalContext";
import { useTheme } from "@/contexts/themeContext";
import { Playlist, PlaylistType } from "@/types/playlist";
import { router } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { FC, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PlaylistCover from "./playlistCover";

interface PlaylistScreenProps {
  /** Playlist id, supplied by the page factory from the route param. */
  id: string;
}

/**
 * Full-screen playlist detail: cover art, title, and a tappable track list.
 *
 * @remarks
 * Presentational and router-free — it receives `id` as a prop and pulls all of
 * its data through the playlist query hooks. Tapping a track starts playback of
 * the whole list from that index, tagging the queue with a `playlist` source so
 * the player can show where playback came from. The overflow menus route to the
 * sheet modal rather than handling actions inline, and the edit affordance is
 * shown only for {@link PlaylistType.USER} playlists (system playlists such as
 * Liked Songs aren't user-editable).
 *
 * @param props - See {@link PlaylistScreenProps}.
 */
const PlaylistScreen: FC<PlaylistScreenProps> = ({ id }) => {
  const { data: playlist, isLoading } = usePlaylist(id);

  if (isLoading) return <PlaylistScreenSkeleton />;

  return <PlaylistScreenContent id={id} playlist={playlist} />;
};

interface PlaylistScreenContentProps extends PlaylistScreenProps {
  /** The loaded playlist; may be `undefined` if the fetch resolved without data. */
  playlist: Playlist | undefined;
}

/**
 * The loaded playlist screen: sticky header, cover, title row, and track list.
 *
 * @remarks
 * Split out from {@link PlaylistScreen} so the sticky-header machinery — the
 * animated scroll ref and {@link useScrollOffset} — only mounts once there's a
 * real {@link Animated.ScrollView} for the ref to attach to.
 */
const PlaylistScreenContent: FC<PlaylistScreenContentProps> = ({
  id,
  playlist,
}) => {
  const { data: playlistTracks } = usePlaylistTracks(id);

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { open } = useSheetModal();

  const { playQueue } = useAudioPlayerContext();

  const tabBarHeight = useBottomTabBarHeight();

  const {
    scrollRef,
    headerBottom,
    onHeaderRowLayout,
    onTitleLayout,
    headerStyle,
  } = useStickyHeaderReveal();

  const onTrackPress = (index: number) => {
    if (!playlistTracks) return;
    playQueue(
      playlistTracks,
      index,
      playlist ? { type: "playlist", name: playlist.name } : null,
    );
  };

  const onOptionPress = () => {
    if (!playlist) return;
    open({ type: SheetType.PLAYLIST, id: playlist?.id });
  };

  const onTrackOptionPress = (trackId: string) => {
    if (!playlist) return;
    open({ type: SheetType.PLAYLIST_TRACK, id: playlist?.id, trackId });
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          paddingHorizontal: 16,
          // Start below the sticky header, which floats over the scroll view.
          paddingTop: headerBottom,
          // Clear both the tab bar and the mini-player that floats above it, so
          // the last track isn't hidden behind them when scrolled to the end.
          paddingBottom: tabBarHeight + 84,
        }}
      >
        <View style={styles.playlistArtContainer}>
          <PlaylistCover
            urls={playlist?.albumCoverUrls}
            style={styles.playlistArt}
          />
        </View>
        <View style={styles.playlistInfoContainer} onLayout={onHeaderRowLayout}>
          <Text style={styles.playlistTitle} onLayout={onTitleLayout}>
            {playlist?.name}
          </Text>
          {playlist?.type === PlaylistType.USER && (
            <Pressable onPress={onOptionPress}>
              <IconSymbol name={"ellipsis"} size={32} color={colors.primary} />
            </Pressable>
          )}
        </View>
        <View style={styles.trackContainer}>
          {playlistTracks?.map((playlistTrack, index) => {
            return (
              <Pressable
                key={playlistTrack.id}
                style={styles.trackItem}
                onPress={() => onTrackPress(index)}
              >
                <View style={styles.trackInfo}>
                  <View style={styles.trackLeftInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>
                      {playlistTrack.title}
                    </Text>
                    <Text style={styles.trackArtists} numberOfLines={1}>
                      {playlistTrack?.artists
                        ?.map((artist) => artist.name)
                        ?.join(", ")}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => onTrackOptionPress(playlistTrack.trackId)}
                  >
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

      <StickyHeader
        title={playlist?.name}
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
    playlistArtContainer: {
      display: "flex",
      alignItems: "center",
      marginBottom: 24,
    },
    playlistArt: {
      width: "60%",
      aspectRatio: 800 / 800,
      borderRadius: 12,
    },
    playlistInfoContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      marginBottom: 24,
    },
    playlistTitle: {
      flex: 1,
      color: colors.primary,
      fontSize: 22,
      fontWeight: 500,
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

/** One placeholder track row: two stacked lines of text. */
const PlaylistTrackRowSkeleton = () => (
  <View style={{ gap: 6 }}>
    <Skeleton width="65%" height={18} borderRadius={4} />
    <Skeleton width="40%" height={14} borderRadius={4} />
  </View>
);

/**
 * Loading placeholder for {@link PlaylistScreen}: a large centered cover, the
 * title row, a "Tracks" header, and a list of track rows — matching the screen's
 * footprint while its queries load.
 */
export const PlaylistScreenSkeleton = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        // Match the loaded screen's content offset so nothing shifts on load.
        paddingTop: insets.top + STICKY_HEADER_CONTENT_HEIGHT,
      }}
      testID="playlist-screen-skeleton"
    >
      <View style={{ paddingHorizontal: 16, gap: 24 }}>
        <View style={{ alignItems: "center" }}>
          <Skeleton width="60%" borderRadius={12} style={{ aspectRatio: 1 }} />
        </View>
        <Skeleton width="55%" height={22} borderRadius={4} />
        <View style={{ gap: 16 }}>
          <Skeleton width="25%" height={18} borderRadius={4} />
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <PlaylistTrackRowSkeleton key={row} />
          ))}
        </View>
      </View>
    </View>
  );
};

export default PlaylistScreen;
