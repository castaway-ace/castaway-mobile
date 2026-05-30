import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { useTheme } from "@/contexts/theme-context";
import { formatTime } from "@/utils/converter";
import { FC, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-worklets";

const ProgressBar: FC = () => {
  const [barWidth, setBarWidth] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  const { currentTime, duration, moveTarget } = useAudioPlayerContext();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
    setScrubTime(target);
    setIsScrubbing(false);
  };

  const seekImmediately = (x: number) => {
    const target = xToTime(x);
    moveTarget(target);
    setScrubTime(target);
    setIsScrubbing(false);
  };

  const tap = Gesture.Tap()
    .maxDuration(250)
    .onEnd((e) => {
      runOnJS(seekImmediately)(e.x);
    });

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => runOnJS(startScrub)(e.x))
    .onUpdate((e) => runOnJS(moveScrub)(e.x))
    .onEnd((e) => runOnJS(endScrub)(e.x));

  const composed = Gesture.Race(tap, pan);

  const displayTime = isScrubbing ? scrubTime : currentTime;
  const progress =
    duration > 0 ? Math.min(Math.max(displayTime / duration, 0), 1) : 0;

  return (
    <View>
      <GestureDetector gesture={composed}>
        <View style={styles.barTouchArea}>
          <View
            style={styles.track}
            onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
          >
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
            <View style={[styles.thumb, { left: `${progress * 100}%` }]} />
          </View>
        </View>
      </GestureDetector>
      <View style={styles.scrollBarInfo}>
        <Text style={{ color: colors.primary }}>{formatTime(displayTime)}</Text>
        <Text style={{ color: colors.primary }}>{formatTime(duration)}</Text>
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
    track: {
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
