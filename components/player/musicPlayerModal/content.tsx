import { CrossfadeIcon } from "../crossfadeIcon";
import { blurHash } from "@/constants/blur";
import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { usePlayerModal } from "@/contexts/playerModalContext";
import { SheetType, useSheetModal } from "@/contexts/sheetModalContext";
import { useTheme } from "@/contexts/themeContext";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useActiveTrackStar, usePlayPause } from "../useNowPlayingControls";
import { usePlayerForeground } from "../usePlayerForeground";
import ProgressBar from "./progressBar";

/**
 * The full-screen player's inner layout: header, artwork, track info, seek bar,
 * and transport controls.
 *
 * @remarks
 * Split out from the modal container ({@link MusicPlayerModal}) so that file owns
 * only presentation/animation while this owns the controls wired to the audio
 * player context. Every icon is a {@link CrossfadeIcon} so the whole control
 * cluster re-tints with the artwork. Renders nothing if the queue empties out
 * from under it.
 */
const MusicPlayerModalContent: FC = () => {
  const { colors } = useTheme();
  const {
    isPlaying,
    next,
    previous,
    currentTrack,
    coverArtUrl,
    coverColor,
    source,
    toggleShuffle,
    isShuffled,
    cycleRepeat,
    repeatMode,
  } = useAudioPlayerContext();
  const { close } = usePlayerModal();
  const { open: openOptions } = useSheetModal();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { palette, primaryTextStyle, secondaryTextStyle } = usePlayerForeground(
    coverColor,
    colors,
  );

  const { starred, toggleStar } = useActiveTrackStar();
  const handlePlayTrack = usePlayPause();

  if (!currentTrack) {
    return null;
  }

  const sourceLabel = source
    ? `Playing from ${source.type === "album" ? "Album" : "Playlist"}`
    : null;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={close}>
          <CrossfadeIcon
            size={32}
            name={"chevron.down"}
            color={palette.primary}
          />
        </Pressable>
        <View style={styles.headerCenter}>
          {source ? (
            <>
              <Animated.Text
                style={[styles.headerLabel, secondaryTextStyle]}
                numberOfLines={1}
              >
                {sourceLabel}
              </Animated.Text>
              <Animated.Text
                style={[styles.headerTitle, primaryTextStyle]}
                numberOfLines={1}
              >
                {source.name}
              </Animated.Text>
            </>
          ) : (
            <Animated.Text style={[styles.headerTitle, primaryTextStyle]}>
              Playing Now
            </Animated.Text>
          )}
        </View>
        <Pressable onPress={() => openOptions({ type: SheetType.NOW_PLAYING })}>
          <CrossfadeIcon size={32} name={"ellipsis"} color={palette.primary} />
        </Pressable>
      </View>
      <View style={styles.albumArtContainer}>
        <Image
          source={{
            uri: coverArtUrl,
          }}
          placeholder={blurHash}
          style={styles.albumArt}
        />
      </View>
      <View style={styles.bottomContainer}>
        <View style={styles.middle}>
          <View style={styles.trackInfoContainer}>
            <Animated.Text
              style={[styles.titleText, primaryTextStyle]}
              numberOfLines={1}
            >
              {currentTrack.title}
            </Animated.Text>
            <Animated.Text
              style={[styles.artistText, secondaryTextStyle]}
              numberOfLines={1}
            >
              {currentTrack.artists?.map((artist) => artist.name)?.join(", ")}
            </Animated.Text>
          </View>
          <Pressable onPress={toggleStar}>
            <CrossfadeIcon
              name={starred ? "heart.fill" : "heart"}
              size={40}
              color={palette.primary}
            />
          </Pressable>
        </View>
        <ProgressBar />
        <View style={styles.musicPlayerButtonContainer}>
          {/* Dim shuffle/repeat when inactive so the icon itself doubles as its
              on/off state without needing a separate indicator. */}
          <Pressable onPress={toggleShuffle}>
            <CrossfadeIcon
              size={40}
              name={"shuffle"}
              style={{ opacity: isShuffled ? 1 : 0.4 }}
              color={palette.primary}
            />
          </Pressable>
          <Pressable onPress={previous}>
            <CrossfadeIcon
              size={40}
              name={"backward.end"}
              color={palette.primary}
            />
          </Pressable>
          <Pressable onPress={handlePlayTrack}>
            <CrossfadeIcon
              size={80}
              name={isPlaying ? "pause.circle.fill" : "play.circle.fill"}
              color={palette.primary}
            />
          </Pressable>
          <Pressable onPress={next}>
            <CrossfadeIcon
              size={40}
              name={"forward.end"}
              color={palette.primary}
            />
          </Pressable>
          {/* Dimmed when off; the "1" badge icon distinguishes repeat-one from
              repeat-all, which otherwise share the plain repeat glyph. */}
          <Pressable onPress={cycleRepeat}>
            <CrossfadeIcon
              size={40}
              style={{ opacity: repeatMode === "off" ? 0.4 : 1 }}
              name={
                repeatMode === "off" || repeatMode === "all"
                  ? "repeat"
                  : "repeat.1"
              }
              color={palette.primary}
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
      marginHorizontal: 8,
    },
    headerLabel: {
      color: colors.secondary,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    headerTitle: {
      color: colors.primary,
      fontWeight: 500,
      fontSize: 16,
    },
    albumArtContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    albumArt: {
      width: "100%",
      aspectRatio: 800 / 800,
      borderRadius: 16,
    },
    bottomContainer: {
      paddingBottom: 48,
    },
    middle: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    trackInfoContainer: {
      flex: 1,
      justifyContent: "center",
      gap: 4,
      marginBottom: 8,
    },
    scrollBarContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    titleText: {
      color: colors.primary,
      fontWeight: 500,
      fontSize: 20,
      width: "90%",
    },
    artistText: {
      color: colors.secondary,
      fontSize: 18,
    },
    favoriteButton: {
      flexShrink: 0,
    },
    musicPlayerButtonContainer: {
      display: "flex",
      flexDirection: "row",
      gap: 24,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 16,
    },
  });

export default MusicPlayerModalContent;
