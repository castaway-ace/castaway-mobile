import { BASE_URL } from "@/api/client";
import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { Image } from "expo-image";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";

const MusicPlayer = () => {
  const { isPlaying, pause, play, currentTrack } = useAudioPlayerContext();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { accessToken } = useAuth();

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
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.leftContainer}>
          <Image
            source={{
              uri: `${BASE_URL}/albums/${currentTrack.albumId}/stream`,
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }}
            style={styles.albumArt}
          />
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artistNames}
            </Text>
          </View>
        </View>
        <Pressable onPress={handlePlayTrack}>
          <IconSymbol
            size={28}
            name={isPlaying ? "pause.fill" : "play.fill"}
            color={colors.primary}
          />
        </Pressable>
      </View>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      padding: 8,
    },
    contentContainer: {
      backgroundColor: colors.accent,
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
  });

export default MusicPlayer;
