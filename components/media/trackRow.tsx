import { IconSymbol } from "@/components/ui/iconSymbol";
import { NowPlayingBars } from "@/components/ui/nowPlayingBars";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { ArtistRef } from "@/types/artists";
import { FC, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface TrackRowProps {
  title: string;
  artists: ArtistRef[] | undefined;
  /**
   * Whether this row is the track the player currently has loaded. Callers are
   * responsible for scoping this to their own screen — see the remarks.
   */
  isActive?: boolean;
  /** Whether the active track is playing rather than paused; ignored unless `isActive`. */
  isPlaying?: boolean;
  onPress: () => void;
  onOptionsPress: () => void;
}

/**
 * One tappable track in an album or playlist listing.
 *
 * @remarks
 * Shared by {@link AlbumScreen} and {@link PlaylistScreen}, whose rows were
 * identical down to the styles. Presentational: it takes the already-resolved
 * `isActive`/`isPlaying` flags and reports presses upward, so it needs neither
 * the player nor the router.
 *
 * Deciding `isActive` is the caller's job because it depends on where playback
 * started — a track is marked on the page it was played *from*, not everywhere
 * it appears. Callers gate on the player's `source` matching their own
 * album/playlist before comparing ids. Note that the comparison must be against
 * `currentTrack` identity and never against the row's index: the player's
 * `position` indexes its shuffled play order, not the rendered list.
 *
 * @param artists - Rendered as a comma-joined byline; optional because the
 * generated track shapes don't guarantee it.
 */
const TrackRow: FC<TrackRowProps> = ({
  title,
  artists,
  isActive = false,
  isPlaying = false,
  onPress,
  onOptionsPress,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable
      style={styles.trackItem}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <View style={styles.trackInfo}>
        <View style={styles.trackLeftInfo}>
          <View style={styles.trackTitleRow}>
            {isActive && <NowPlayingBars animating={isPlaying} />}
            <Text
              style={[styles.trackTitle, isActive && styles.trackTitleActive]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
          <Text style={styles.trackArtists} numberOfLines={1}>
            {artists?.map((artist) => artist.name)?.join(", ")}
          </Text>
        </View>
        <Pressable onPress={onOptionsPress}>
          <IconSymbol name={"ellipsis"} size={32} color={colors.primary} />
        </Pressable>
      </View>
    </Pressable>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
    trackTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    trackTitle: {
      color: colors.primary,
      fontSize: 18,
      // Shrink rather than push: a long title truncates against the indicator
      // instead of driving the overflow button off the row.
      flexShrink: 1,
    },
    trackTitleActive: {
      color: colors.accent,
    },
    trackArtists: {
      color: colors.secondary,
      fontSize: 16,
    },
  });

export default TrackRow;
