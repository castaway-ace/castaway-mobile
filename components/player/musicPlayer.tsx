import { blurHash } from "@/constants/blur";
import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { usePlayerModal } from "@/contexts/playerModalContext";
import { useTheme } from "@/contexts/themeContext";
import { presignedImageSource } from "@/utils/images";
import { Image } from "expo-image";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { CrossfadeIcon } from "./crossfadeIcon";
import TrackInfoCarousel from "./trackInfoCarousel";
import { useAnimatedBackground } from "./useAnimatedBackground";
import { useActiveTrackStar, usePlayPause } from "./useNowPlayingControls";
import { usePlayerForeground } from "./usePlayerForeground";
import { useCarouselStrip, useTrackSwipe } from "./useTrackSwipe";

/**
 * The persistent mini-player docked above the tab bar.
 *
 * @remarks
 * Renders nothing when the queue is empty, so it only occupies space while
 * something is loaded. Tapping the track info expands the full-screen player
 * modal; the star and play/pause controls act inline without expanding. Its
 * colors are driven by the cover art via {@link useAnimatedBackground} /
 * {@link usePlayerForeground}, and icons crossfade through {@link CrossfadeIcon},
 * so the whole bar re-tints smoothly as tracks change.
 *
 * Swiping the bar sideways changes track ({@link useTrackSwipe}); the artwork
 * stays put and the {@link TrackInfoCarousel} is what follows the finger.
 */
const MusicPlayer = () => {
  const {
    isPlaying,
    isLoading,
    currentTrack,
    previousTrack,
    nextTrack,
    coverArtUrl,
    coverColor,
    currentTime,
    duration,
  } = useAudioPlayerContext();
  const { open } = usePlayerModal();
  const { colors } = useTheme();
  const { starred, toggleStar } = useActiveTrackStar();
  const handlePlayTrack = usePlayPause();
  const swipe = useTrackSwipe();
  const info = useCarouselStrip(swipe);
  const { onSwipeScaleLayout } = swipe;
  const { onViewportLayout: measureInfo } = info;
  // The text strip is both the measured strip and the swipe's reference width, so
  // the text keeps tracking the finger 1:1 even though the whole bar is the hit
  // area.
  const onViewportLayout = useCallback(
    (event: LayoutChangeEvent) => {
      measureInfo(event);
      onSwipeScaleLayout(event);
    },
    [measureInfo, onSwipeScaleLayout],
  );
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const backgroundStyle = useAnimatedBackground(coverColor, colors.background);
  const {
    palette,
    primaryTextStyle,
    secondaryTextStyle,
    primaryBgStyle,
    secondaryBgStyle,
  } = usePlayerForeground(coverColor, colors);

  // Clamp to [0, 1] and guard divide-by-zero before duration is known, so the
  // progress fill can't overflow the bar or NaN out on the first frames.
  const progress =
    duration > 0 ? Math.min(Math.max(currentTime / duration, 0), 1) : 0;

  // Nothing playing: hide the bar entirely.
  if (!currentTrack) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.secondaryContainer, backgroundStyle]}>
        <GestureDetector gesture={swipe.pan}>
          <View style={styles.contentContainer}>
            <Pressable style={styles.leftContainer} onPress={open}>
              <Image
                source={
                  coverArtUrl ? presignedImageSource(coverArtUrl) : undefined
                }
                placeholder={blurHash}
                style={styles.albumArt}
              />
              <TrackInfoCarousel
                {...info}
                onViewportLayout={onViewportLayout}
                previousTrack={previousTrack}
                currentTrack={currentTrack}
                nextTrack={nextTrack}
                titleStyle={styles.titleText}
                artistStyle={styles.artistText}
                primaryTextStyle={primaryTextStyle}
                secondaryTextStyle={secondaryTextStyle}
              />
            </Pressable>
            <View style={styles.buttonContainer}>
              <Pressable onPress={toggleStar}>
                <CrossfadeIcon
                  name={starred ? "heart.fill" : "heart"}
                  size={32}
                  color={palette.primary}
                />
              </Pressable>
              <Pressable onPress={handlePlayTrack} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={palette.primary}
                    style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}
                  />
                ) : (
                  <CrossfadeIcon
                    size={28}
                    name={isPlaying ? "pause.fill" : "play.fill"}
                    color={palette.primary}
                  />
                )}
              </Pressable>
            </View>
          </View>
        </GestureDetector>
        <View style={styles.barArea}>
          <Animated.View style={[styles.bar, secondaryBgStyle]}>
            <Animated.View
              style={[
                styles.fill,
                primaryBgStyle,
                { width: `${progress * 100}%` },
              ]}
            />
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      padding: 8,
    },
    secondaryContainer: {
      backgroundColor: colors.accent,
      borderRadius: 12,
    },
    contentContainer: {
      borderRadius: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    leftContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    albumArt: {
      width: 48,
      height: 48,
      borderRadius: 4,
    },
    titleText: {
      fontWeight: 700,
      fontSize: 18,
      color: colors.primary,
    },
    artistText: {
      fontSize: 14,
      color: colors.secondary,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 16,
      alignItems: "center",
    },
    barArea: {
      paddingHorizontal: 8,
      paddingBottom: 1,
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
  });

export default MusicPlayer;
