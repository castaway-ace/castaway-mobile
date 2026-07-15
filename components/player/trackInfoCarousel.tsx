import { ThemeColors } from "@/constants/theme";
import { PlayableTrack } from "@/contexts/audioPlayerContext";
import { useTheme } from "@/contexts/themeContext";
import { FC, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { usePlayerForeground } from "./usePlayerForeground";
import { TrackSwipe } from "./useTrackSwipe";

type TextStyle = ReturnType<typeof usePlayerForeground>["primaryTextStyle"];

interface TrackInfoBlockProps {
  track: PlayableTrack | null;
  /** Fixed block width so the trio lines up on the strip's grid; unset pre-layout. */
  width?: number;
  primaryTextStyle: TextStyle;
  secondaryTextStyle: TextStyle;
}

/**
 * One track's title and artist line, sized to a single slot of the carousel.
 *
 * @remarks
 * Both lines stay clamped to one line so the mini-player's height can't jitter as
 * the neighboring blocks mount or the track changes.
 */
const TrackInfoBlock: FC<TrackInfoBlockProps> = ({
  track,
  width,
  primaryTextStyle,
  secondaryTextStyle,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!track) {
    return <View style={[styles.block, { width }]} />;
  }

  return (
    <View style={[styles.block, { width }]}>
      <Animated.Text style={[styles.title, primaryTextStyle]} numberOfLines={1}>
        {track.title}
      </Animated.Text>
      <Animated.Text
        style={[styles.artist, secondaryTextStyle]}
        numberOfLines={1}
      >
        {track.artists?.map((artist) => artist.name)?.join(", ")}
      </Animated.Text>
    </View>
  );
};

interface TrackInfoCarouselProps
  extends Pick<
    TrackSwipe,
    "stripStyle" | "restingLeft" | "width" | "onViewportLayout"
  > {
  previousTrack: PlayableTrack | null;
  currentTrack: PlayableTrack;
  nextTrack: PlayableTrack | null;
  primaryTextStyle: TextStyle;
  secondaryTextStyle: TextStyle;
}

/**
 * The mini-player's track title and artist lines, rendered as a three-slot strip
 * that slides with the swipe so the neighboring track is visible mid-drag.
 *
 * @remarks
 * Positioning is owned by {@link useTrackSwipe}: `restingLeft` is a plain style
 * that re-anchors the strip in the same React commit the trio shifts, while
 * `stripStyle` carries the animated drag. See that hook for why the two are split.
 *
 * The neighbors only render once the viewport has been measured. That costs
 * nothing visually: before measurement `restingLeft` and the transform are both
 * zero, so the lone current block sits at exactly the x it occupies afterwards.
 *
 * Foreground text styles are passed in rather than each block calling
 * {@link usePlayerForeground} itself — three copies would mean three sets of
 * shared values easing toward the same target. Sharing one style also means a
 * peeking neighbor is already tinted for the current cover, and the whole strip
 * re-tints together once the new cover's color resolves.
 */
const TrackInfoCarousel: FC<TrackInfoCarouselProps> = ({
  previousTrack,
  currentTrack,
  nextTrack,
  primaryTextStyle,
  secondaryTextStyle,
  stripStyle,
  restingLeft,
  width,
  onViewportLayout,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const measured = width > 0;

  return (
    <View
      style={styles.viewport}
      onLayout={onViewportLayout}
      testID="track-info-viewport"
    >
      <Animated.View style={[styles.strip, { left: restingLeft }, stripStyle]}>
        {measured && (
          <TrackInfoBlock
            track={previousTrack}
            width={width}
            primaryTextStyle={primaryTextStyle}
            secondaryTextStyle={secondaryTextStyle}
          />
        )}
        <TrackInfoBlock
          track={currentTrack}
          width={measured ? width : undefined}
          primaryTextStyle={primaryTextStyle}
          secondaryTextStyle={secondaryTextStyle}
        />
        {measured && (
          <TrackInfoBlock
            track={nextTrack}
            width={width}
            primaryTextStyle={primaryTextStyle}
            secondaryTextStyle={secondaryTextStyle}
          />
        )}
      </Animated.View>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    viewport: {
      flex: 1,
      overflow: "hidden",
    },
    strip: {
      flexDirection: "row",
    },
    block: {
      flexDirection: "column",
      gap: 4,
    },
    title: {
      fontWeight: 700,
      fontSize: 18,
      color: colors.primary,
    },
    artist: {
      fontSize: 14,
      color: colors.secondary,
    },
  });

export default TrackInfoCarousel;
