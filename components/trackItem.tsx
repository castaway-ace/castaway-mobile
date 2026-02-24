import { getAlbumCoverUrl } from "@/config/api";
import { TrackItemDto } from "@/types/tracks";
import { FC } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "./ui/icon-symbol";

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

interface TrackItemProps {
  track: TrackItemDto;
  onPress: () => void;
}

export const TrackItem: FC<TrackItemProps> = ({ track, onPress }) => {
  const { artists, title, album, duration } = track;

  const formattedDuration = formatDuration(duration ?? 0);

  const coverUrl = getAlbumCoverUrl(album.id);

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.containerContent}>
        <Image source={{ uri: coverUrl }} style={styles.albumArt} />
        <View style={styles.info}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {artists.map((artist) => artist.name).join(", ")}
          </Text>
        </View>
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.duration}>{formattedDuration}</Text>
        <Pressable
          style={styles.ellipsis}
          onPress={(e) => {
            e.stopPropagation();
            // TODO: open track menu
          }}
        >
          <IconSymbol size={24} name="ellipsis" color={"black"} />
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 8,
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
  },
  trackArtist: {
    fontSize: 14,
    fontWeight: "500",
  },
  info: {
    flex: 1,
    flexDirection: "column",
    gap: 8,
  },
  duration: {
    fontSize: 14,
    fontWeight: "500",
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
