import { ListTrackItem } from "@/types/tracks";
import { FC } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "./ui/icon-symbol";

interface TrackItemProps {
  track: ListTrackItem;
  onPress: () => void;
}

export const TrackItem: FC<TrackItemProps> = ({ track, onPress }) => {
  const { artists, album, title, albumUrl, duration } = track;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.containerContent}>
        <Image source={{ uri: albumUrl }} style={styles.albumArt} />
        <View style={styles.info}>
          <Text style={styles.trackTitle}>{title}</Text>

          <Text>
            {artists.map((artist) => artist.name).join(", ")} - {album.title}
          </Text>
          <Text>{duration}</Text>
        </View>
      </View>
      <Pressable>
        <IconSymbol size={28} name="ellipsis" color={"black"} />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: "red",
    borderRadius: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },

  containerContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
  },

  trackTitle: {
    fontWeight: 500,
  },
  info: {
    display: "flex",
    flexDirection: "column",
  },
});
