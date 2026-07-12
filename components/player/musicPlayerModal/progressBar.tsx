import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { useTheme } from "@/contexts/themeContext";
import { formatTime } from "@/utils/formatters";
import { FC, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import { usePlayerForeground } from "../usePlayerForeground";

/**
 * Interactive seek bar for the full-screen player: shows elapsed/total time and
 * lets the user tap or drag to seek.
 *
 * @remarks
 * While the user is scrubbing, the bar follows their finger (`scrubTime`) rather
 * than the still-advancing playback clock, so it doesn't fight the drag; on
 * release it commits the target through the context's optimistic
 * {@link moveTarget} and hands display back to `currentTime`. Gesture callbacks
 * run on the UI thread, so every state update is marshaled back with `runOnJS`.
 */
const ProgressBar: FC = () => {
  const [barWidth, setBarWidth] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  const { currentTime, duration, moveTarget, play, isPlaying, coverColor } =
    useAudioPlayerContext();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { primaryTextStyle, primaryBgStyle, secondaryBgStyle } =
    usePlayerForeground(coverColor, colors);

  // Map a touch x-offset to a track time, clamped to the bar. Guards the first
  // frames before `onLayout` reports a width and before duration is known.
  const xToTime = (x: number) => {
    if (barWidth <= 0 || duration <= 0) {
      return 0;
    }
    const ratio = Math.min(Math.max(x / barWidth, 0), 1);
    return ratio * duration;
  };

  const startScrub = (x: number) => {
    setIsScrubbing(true);
    setScrubTime(xToTime(x));
  };

  const moveScrub = (x: number) => setScrubTime(xToTime(x));
  const endScrub = (x: number) => {
    const target = xToTime(x);
    moveTarget(target);
    // Nudge playback to resume if it was playing; seeking can momentarily pause
    // the engine, so this keeps a scrub from silently stopping audio.
    if (isPlaying) play();
    setScrubTime(target);
    setIsScrubbing(false);
  };

  const seekImmediately = (x: number) => {
    const target = xToTime(x);
    moveTarget(target);
    setScrubTime(target);
    setIsScrubbing(false);
    if (isPlaying) play();
  };

  const tap = Gesture.Tap()
    .maxDuration(250)
    .onEnd((e) => {
      runOnJS(seekImmediately)(e.x);
    });

  const pan = Gesture.Pan()
    // minDistance(0): begin scrubbing on the smallest movement so a slow drag
    // from rest is treated as a scrub, not swallowed as a stationary press.
    .minDistance(0)
    .onBegin((e) => runOnJS(startScrub)(e.x))
    .onUpdate((e) => runOnJS(moveScrub)(e.x))
    .onEnd((e) => runOnJS(endScrub)(e.x));

  // Race, not Simultaneous: a quick touch resolves as a tap-to-seek while a
  // sustained movement becomes a scrub, and the two never both fire.
  const composed = Gesture.Race(tap, pan);

  // Prefer the scrub position while dragging; otherwise the live clock.
  const displayTime = isScrubbing ? scrubTime : currentTime;
  const progress =
    duration > 0 ? Math.min(Math.max(displayTime / duration, 0), 1) : 0;

  return (
    <View>
      <GestureDetector gesture={composed}>
        <View style={styles.barTouchArea}>
          <Animated.View
            style={[styles.bar, secondaryBgStyle]}
            onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
          >
            <Animated.View
              style={[styles.fill, primaryBgStyle, { width: `${progress * 100}%` }]}
            />
            <Animated.View
              style={[styles.thumb, primaryBgStyle, { left: `${progress * 100}%` }]}
            />
          </Animated.View>
        </View>
      </GestureDetector>
      <View style={styles.scrollBarInfo}>
        <Animated.Text style={primaryTextStyle}>
          {formatTime(displayTime)}
        </Animated.Text>
        <Animated.Text style={primaryTextStyle}>
          {formatTime(duration)}
        </Animated.Text>
      </View>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    barTouchArea: {
      paddingTop: 16,
      paddingBottom: 8,
    },
    bar: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.secondary,
      justifyContent: "center",
    },
    fill: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.primary,
    },
    thumb: {
      position: "absolute",
      width: 12,
      height: 12,
      borderRadius: 8,
      marginLeft: -8,
      backgroundColor: colors.primary,
    },
    scrollBarInfo: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
  });
export default ProgressBar;
