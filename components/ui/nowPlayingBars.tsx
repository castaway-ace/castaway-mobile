import { useTheme } from "@/contexts/themeContext";
import { FC, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
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
 * How long a bar takes to glide back to the baseline when playback resumes.
 *
 * @remarks
 * See {@link Bar} for why resuming can't simply restart the pulse in place.
 */
const BAR_REBASE_MS = 150;

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
 * Pausing cancels in place, leaving the bar at whatever height it had reached,
 * so a paused track reads as suspended rather than stopped. Resuming can't just
 * restart the pulse from there, though: `withRepeat`'s reversing cycle swings
 * between the target and the value the animation *started* at, so resuming from
 * a nearly-full bar would oscillate between nearly-full and full — a twitch
 * rather than a pulse. So a resume first glides back down to the baseline and
 * only then re-enters the loop.
 */
const Bar: FC<BarProps> = ({ duration, animating, color }) => {
  const height = useSharedValue(BAR_MIN_HEIGHT);

  useEffect(() => {
    if (!animating) {
      cancelAnimation(height);
      return;
    }

    height.value = withSequence(
      withTiming(BAR_MIN_HEIGHT, { duration: BAR_REBASE_MS }),
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
  /** Pulse while true; freeze in place while false. */
  animating: boolean;
  /** Bar tint; defaults to the theme accent. */
  color?: string;
  testID?: string;
}

/**
 * A small equalizer marking the track that is currently playing.
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
