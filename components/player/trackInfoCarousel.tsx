import { CAROUSEL_GAP } from "@/constants/player";
import { PlayableTrack } from "@/contexts/audioPlayerContext";
import { isVariousArtists } from "@/utils/artists";
import { FC } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { usePlayerForeground } from "./usePlayerForeground";
// Type-only: importing a value from here would pull the audio engine in behind it.
import type { CarouselStrip } from "./useTrackSwipe";

type AnimatedTextStyle = ReturnType<
  typeof usePlayerForeground
>["primaryTextStyle"];

interface TrackInfoBlockProps {
  track: PlayableTrack | null;
  /** Fixed block width so the trio lines up on the strip's grid; unset pre-layout. */
  width?: number;
  titleStyle: StyleProp<TextStyle>;
  artistStyle: StyleProp<TextStyle>;
  primaryTextStyle: AnimatedTextStyle;
  secondaryTextStyle: AnimatedTextStyle;
  onArtistPress?: (track: PlayableTrack) => void;
}

/**
 * One track's title and artist line, sized to a single slot of the carousel.
 *
 * @remarks
 * Both lines stay clamped to one line so the strip's height can't jitter as the
 * neighboring blocks mount or the track changes. The animated color style is
 * applied last because the caller's own title/artist styles also set `color`.
 */
const TrackInfoBlock: FC<TrackInfoBlockProps> = ({
  track,
  width,
  titleStyle,
  artistStyle,
  primaryTextStyle,
  secondaryTextStyle,
  onArtistPress,
}) => {
  if (!track) {
    return <View style={[styles.block, { width }]} />;
  }

  const artistLine = (
    <Animated.Text style={[artistStyle, secondaryTextStyle]} numberOfLines={1}>
      {track.artists?.map((artist) => artist.name)?.join(", ")}
    </Animated.Text>
  );

  const artistNavigable =
    !!onArtistPress &&
    !(track.artists?.length === 1 && isVariousArtists(track.artists[0]));

  return (
    <View style={[styles.block, { width }]}>
      <Animated.Text style={[titleStyle, primaryTextStyle]} numberOfLines={1}>
        {track.title}
      </Animated.Text>
      {artistNavigable ? (
        <Pressable onPress={() => onArtistPress?.(track)}>
          {artistLine}
        </Pressable>
      ) : (
        artistLine
      )}
    </View>
  );
};

interface TrackInfoCarouselProps extends CarouselStrip {
  previousTrack: PlayableTrack | null;
  currentTrack: PlayableTrack;
  nextTrack: PlayableTrack | null;
  titleStyle: StyleProp<TextStyle>;
  artistStyle: StyleProp<TextStyle>;
  primaryTextStyle: AnimatedTextStyle;
  secondaryTextStyle: AnimatedTextStyle;
  /**
   * Receives the pressed block's own track. Omit to leave the lines inert — the
   * mini-player's text already sits inside its expand-the-player `Pressable`.
   */
  onArtistPress?: (track: PlayableTrack) => void;
}

/**
 * A track's title and artist lines, rendered as a three-slot strip that slides with
 * the swipe so the neighboring track is visible mid-drag.
 *
 * @remarks
 * Typography comes from the caller so one component can serve both players, which
 * look quite different; only the layout is shared. Positioning is owned by
 * {@link useCarouselStrip} — `restingLeft` is a plain style that re-anchors the
 * strip in the same React commit the trio shifts, while `stripStyle` carries the
 * animated drag. See {@link useTrackSwipe} for why the two are split.
 *
 * The neighbors only render once the viewport has been measured. That costs nothing
 * visually: before measurement `restingLeft` and the transform are both zero, so
 * the lone current block sits at exactly the x it occupies afterwards.
 *
 * The animated color styles are passed in rather than each block calling
 * {@link usePlayerForeground} itself — three copies would mean three sets of shared
 * values easing toward the same target. Sharing one style also means a peeking
 * neighbor is already tinted for the current cover, and the whole strip re-tints
 * together once the new cover's color resolves.
 */
const TrackInfoCarousel: FC<TrackInfoCarouselProps> = ({
  previousTrack,
  currentTrack,
  nextTrack,
  titleStyle,
  artistStyle,
  primaryTextStyle,
  secondaryTextStyle,
  stripStyle,
  restingLeft,
  width,
  onViewportLayout,
  onArtistPress,
}) => {
  const measured = width > 0;
  // Every block gets the handler, not just the centered one: at rest the neighbors
  // are clipped out of reach anyway, and if one is ever reachable its line should
  // navigate to its own artist rather than sitting inert.
  const blockProps = {
    titleStyle,
    artistStyle,
    primaryTextStyle,
    secondaryTextStyle,
    onArtistPress,
  };

  return (
    <View
      style={styles.viewport}
      onLayout={onViewportLayout}
      testID="track-info-viewport"
    >
      <Animated.View style={[styles.strip, { left: restingLeft }, stripStyle]}>
        {measured && (
          <TrackInfoBlock track={previousTrack} width={width} {...blockProps} />
        )}
        <TrackInfoBlock
          track={currentTrack}
          width={measured ? width : undefined}
          {...blockProps}
        />
        {measured && (
          <TrackInfoBlock track={nextTrack} width={width} {...blockProps} />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  // The row gap is what `useCarouselStrip` accounts for in its pitch — the two have
  // to stay in step or the strip drifts off its grid.
  strip: {
    flexDirection: "row",
    gap: CAROUSEL_GAP,
  },
  block: {
    justifyContent: "center",
    gap: 4,
  },
});

export default TrackInfoCarousel;
