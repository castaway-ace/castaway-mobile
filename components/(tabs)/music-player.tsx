import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { usePlayerModal } from "@/contexts/player-modal-context";
import { useTheme } from "@/contexts/theme-context";
import { Image } from "expo-image";
import { useMemo } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useTrackStar } from "../../api/tracks/mutations";
import { useTrack } from "../../api/tracks/queries";
import { blurHash } from "../../constants/blur";
import { IconSymbol } from "../ui/icon-symbol";

const MusicPlayer = () => {
  const {
    isPlaying,
    isLoading,
    pause,
    play,
    currentTrack,
    coverArtUrl,
    currentTime,
    duration,
  } = useAudioPlayerContext();
  const { open } = usePlayerModal();
  const { colors } = useTheme();
  const { mutate: trackStar } = useTrackStar();
  const activeTrackId = currentTrack
    ? "trackId" in currentTrack
      ? currentTrack.trackId
      : currentTrack.id
    : undefined;
  const { data: trackDetail } = useTrack(activeTrackId);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const progress =
    duration > 0 ? Math.min(Math.max(currentTime / duration, 0), 1) : 0;

  if (!currentTrack) {
    return null;
  }

  const starred = !!trackDetail?.starred;

  const onLikeTrackButtonPress = () => {
    if (!activeTrackId) return;
    trackStar({ id: activeTrackId, starred });
  };

  const handlePlayTrack = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.secondaryContainer}>
        <View style={styles.contentContainer}>
          <Pressable style={styles.leftContainer} onPress={open}>
            <Image
              source={{
                uri: coverArtUrl,
              }}
              placeholder={blurHash}
              style={styles.albumArt}
            />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {currentTrack.artists?.map((artist) => artist.name)?.join(", ")}
              </Text>
            </View>
          </Pressable>
          <View style={styles.buttonContainer}>
            <Pressable>
              <Pressable onPress={onLikeTrackButtonPress}>
                <IconSymbol
                  name={starred ? "heart.fill" : "heart"}
                  size={32}
                  color={colors.primary}
                />
              </Pressable>
            </Pressable>
            <Pressable onPress={handlePlayTrack} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}
                />
              ) : (
                <IconSymbol
                  size={28}
                  name={isPlaying ? "pause.fill" : "play.fill"}
                  color={colors.primary}
                />
              )}
            </Pressable>
          </View>
        </View>
        <View style={styles.barArea}>
          <View style={styles.bar}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      </View>
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
    title: {
      fontWeight: 700,
      fontSize: 18,
      color: colors.primary,
    },
    albumArt: {
      width: 48,
      height: 48,
      borderRadius: 4,
    },
    artist: {
      fontSize: 14,
      color: colors.secondary,
    },
    info: {
      flex: 1,
      flexDirection: "column",
      gap: 4,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 16,
      alignItems: "center",
    },
    barArea: {
      paddingHorizontal: 8,
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
