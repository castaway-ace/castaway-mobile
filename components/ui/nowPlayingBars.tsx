import { useTheme } from "@/contexts/themeContext";
import { FC, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

/** Bar geometry, in px. */
const BAR_WIDTH = 3;
const BAR_GAP = 3;
const BAR_MIN_HEIGHT = 4;
const BAR_MAX_HEIGHT = 14;

/**
 * How long one bar takes to rise from {@link BAR_MIN_HEIGHT} to
 * {@link BAR_MAX_HEIGHT}, per bar.
 *
 * @remarks
 * Deliberately unequal, and not multiples of one another, so the bars drift out
 * of phase instead of marching in lockstep and settling into a visibly repeating
 * pattern. The length of this array is also what decides how many bars render.
 */
const BAR_DURATIONS = [520, 400, 640];

/**
 * How long a bar takes to settle back onto the baseline when playback pauses.
 *
 * @remarks
 * Short enough to read as a response to the tap, but eased rather than snapped —
 * dropping flat in a single frame reads as the row breaking, not as the music
 * stopping.
 */
const BAR_COLLAPSE_MS = 300;

interface BarProps {
  /** Length of this bar's rise; see {@link BAR_DURATIONS}. */
  duration: number;
  animating: boolean;
  color: string;
}

/**
 * A single bar of the equalizer.
 *
 * @remarks
 * Its own component so that each bar owns a shared value — hooks can't be called
 * from inside the `map` that renders them.
 *
 * Height is animated in pixels rather than as a percentage or a `scaleY`
 * transform: a percentage would need the parent's height resolved on the UI
 * thread, and `scaleY` would have to fight the default center transform origin
 * to grow upward. At three bars of {@link BAR_WIDTH} px, laying out a real
 * height every frame costs nothing.
 *
 * Pausing collapses the bar back to the baseline rather than stopping it where
 * it stood, so a paused row settles into a flat, inert dash. Assigning the
 * collapse is enough to call off the pulse — a new animation replaces whatever
 * was running — so there's nothing to cancel first.
 *
 * Resuming re-enters the loop *via* the baseline instead of straight from the
 * current height: `withRepeat`'s reversing cycle swings between its target and
 * the height the animation started at, so a bar caught mid-collapse would
 * otherwise pulse across that stunted range forever instead of the full one.
 */
const Bar: FC<BarProps> = ({ duration, animating, color }) => {
  const height = useSharedValue(BAR_MIN_HEIGHT);

  useEffect(() => {
    if (!animating) {
      height.value = withTiming(BAR_MIN_HEIGHT, { duration: BAR_COLLAPSE_MS });
      return;
    }

    height.value = withSequence(
      withTiming(BAR_MIN_HEIGHT, { duration: BAR_COLLAPSE_MS }),
      withRepeat(
        withTiming(BAR_MAX_HEIGHT, {
          duration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
  }, [animating, duration, height]);

  const animatedStyle = useAnimatedStyle(() => ({ height: height.value }));

  return (
    <Animated.View
      style={[styles.bar, { backgroundColor: color }, animatedStyle]}
    />
  );
};

interface NowPlayingBarsProps {
  /** Pulse while true; settle flat while false. */
  animating: boolean;
  /** Bar tint; defaults to the theme accent. */
  color?: string;
  testID?: string;
}

/**
 * A small equalizer marking the track that is currently playing: bars pulse
 * while audio plays and collapse to a flat baseline while it's paused.
 *
 * @remarks
 * Purely presentational — it takes `animating` rather than reading the player,
 * so it stays a `ui/` primitive that any list can drop beside a title, and can
 * be exercised in tests without a player context.
 *
 * Built from plain `Animated.View`s rather than an animated vector icon: as
 * `CrossfadeIcon` documents, wrapping an icon font in reanimated's
 * `createAnimatedComponent` yields `undefined` at runtime in v4.
 *
 * @param animating - Whether audio is actually playing. Distinct from *which*
 * row is active: the caller decides that by mounting this component at all, and
 * this flag then says whether that active row is playing or paused.
 * @param color - Overrides the accent tint, for surfaces where accent wouldn't
 * carry enough contrast (e.g. over cover art).
 */
export const NowPlayingBars: FC<NowPlayingBarsProps> = ({
  animating,
  color,
  testID,
}) => {
  const { colors } = useTheme();

  return (
    // Labelled rather than hidden as decoration: the bars are the only thing
    // marking this row as the active one, so a screen reader that skipped them
    // would lose that state entirely.
    <View
      style={styles.container}
      accessible
      accessibilityLabel={animating ? "Now playing" : "Paused"}
      testID={testID}
    >
      {BAR_DURATIONS.map((duration) => (
        <Bar
          key={duration}
          duration={duration}
          animating={animating}
          color={color ?? colors.accent}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    // Pin the bars to a common baseline so they grow upward, and hold the full
    // height so neighboring text doesn't reflow as they pulse.
    alignItems: "flex-end",
    height: BAR_MAX_HEIGHT,
    gap: BAR_GAP,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 1,
  },
});

export default NowPlayingBars;
