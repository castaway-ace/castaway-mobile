import { useAlbumCover } from "@/api/queries/albums";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { TrackSummary } from "@/types/tracks";
import { formatDuration } from "@/utils/converter";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";

interface TrackItemProps {
  track: TrackSummary;
  onPress: () => void;
}

const TrackItem: FC<TrackItemProps> = ({ track, onPress }) => {
  const { colors } = useTheme();
  const { data: albumArtUrl } = useAlbumCover(track.albumId);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { artistNames, title, duration, albumId } = track;

  const formattedDuration = formatDuration(duration ?? 0);

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.containerContent}>
        <Image
          source={{
            uri: albumArtUrl,
          }}
          style={styles.albumArt}
        />
        <View style={styles.info}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {artistNames.map((artist) => artist).join(", ")}
          </Text>
        </View>
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.duration}>{formattedDuration}</Text>
        <Pressable
          style={styles.ellipsis}
          onPress={(e) => {
            e.stopPropagation();
          }}
        >
          <IconSymbol size={24} name="ellipsis" color={colors.primary} />
        </Pressable>
      </View>
    </Pressable>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    containerContent: {
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
    trackTitle: {
      fontWeight: "700",
      fontSize: 16,
      color: colors.primary,
    },
    trackArtist: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.secondary,
    },
    info: {
      flex: 1,
      flexDirection: "column",
      gap: 8,
    },
    duration: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.primary,
    },
    rightContainer: {
      paddingLeft: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    ellipsis: {
      padding: 8,
    },
  });

export default TrackItem;
