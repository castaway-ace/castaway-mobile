import { useAlbumCover } from "@/api/queries/albums";
import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { usePlayerModal } from "@/contexts/player-modal-context";
import { useTheme } from "@/contexts/theme-context";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { blurHash } from "../../../constants/blur";
import { IconSymbol } from "../../ui/icon-symbol";
import ProgressBar from "./progressBar";

const ModalContent: FC = () => {
  const { colors } = useTheme();
  const {
    isPlaying,
    pause,
    play,
    next,
    previous,
    currentTrack,
    toggleShuffle,
    isShuffled,
    cycleRepeat,
    repeatMode,
  } = useAudioPlayerContext();
  const { close } = usePlayerModal();
  const { data: albumArtUrl } = useAlbumCover(currentTrack?.albumId);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!currentTrack) {
    return null;
  }

  const handlePlayTrack = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={close}>
          <IconSymbol size={32} name={"chevron.down"} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerText}>Playing Now</Text>
        <IconSymbol size={32} name={"ellipsis"} color={colors.primary} />
      </View>
      <View style={styles.albumArtContainer}>
        <Image
          source={{
            uri: albumArtUrl,
          }}
          placeholder={blurHash}
          style={styles.albumArt}
        />
      </View>
      <View style={styles.middle}>
        <View style={styles.trackInfoContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artistText} numberOfLines={1}>
            {currentTrack.artistNames}
          </Text>
        </View>
        <Pressable>
          <IconSymbol size={40} name={"heart"} color={colors.primary} />
        </Pressable>
      </View>
      <ProgressBar />
      <View style={styles.musicPlayerButtonContainer}>
        <Pressable onPress={toggleShuffle}>
          <IconSymbol
            size={40}
            name={"shuffle"}
            style={{ opacity: isShuffled ? 1 : 0.4 }}
            color={colors.primary}
          />
        </Pressable>
        <Pressable onPress={previous}>
          <IconSymbol size={40} name={"backward.end"} color={colors.primary} />
        </Pressable>
        <Pressable onPress={handlePlayTrack}>
          <IconSymbol
            size={80}
            name={isPlaying ? "pause.circle.fill" : "play.circle.fill"}
            color={colors.primary}
          />
        </Pressable>
        <Pressable onPress={next}>
          <IconSymbol size={40} name={"forward.end"} color={colors.primary} />
        </Pressable>
        <Pressable onPress={cycleRepeat}>
          <IconSymbol
            size={40}
            style={{ opacity: repeatMode === "off" ? 0.4 : 1 }}
            name={
              repeatMode === "off" || repeatMode == "all"
                ? "repeat"
                : "repeat.1"
            }
            color={colors.primary}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      display: "flex",
      padding: 16,
    },
    header: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 32,
    },
    headerText: {
      color: colors.primary,
      fontWeight: 500,
      fontSize: 20,
    },
    albumArtContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    albumArt: {
      width: "100%",
      aspectRatio: 800 / 800,
      borderRadius: 16,
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

export default ModalContent;
