import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { useBottomInset } from "@/contexts/bottomInsetContext";
import { BottomTabBar } from "expo-router/js-tabs";
import { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import MusicPlayer from "@/components/player/musicPlayer";

/**
 * The app's tab bar, extended to stack the mini-player directly above the native
 * bar.
 *
 * @remarks
 * Wraps the default `BottomTabBar` with {@link MusicPlayer} (shown only when
 * something is playing) so the two move as one docked unit. It also reports its
 * measured height to {@link useBottomInset}, the one place that knows how much
 * the docked stack — bar plus mini-player — covers, so screens can pad their
 * content past it and toasts can float above it.
 */
const CustomTabBar = (props: ComponentProps<typeof BottomTabBar>) => {
  const { currentTrack } = useAudioPlayerContext();
  const { setBottomInset } = useBottomInset();

  return (
    <View
      style={styles.container}
      // Publish the combined height so the toast can clear it.
      onLayout={(e) => setBottomInset(e.nativeEvent.layout.height)}
    >
      {currentTrack && <MusicPlayer />}
      <BottomTabBar {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    // Structural, not themed: the wrapper must be see-through so the screen
    // shows through the gap beside the mini-player; the bar supplies its own fill.
    backgroundColor: "transparent",
  },
});

export default CustomTabBar;
