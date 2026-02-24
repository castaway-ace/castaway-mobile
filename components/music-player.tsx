import { getAlbumCoverUrl } from "@/config/api";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "./ui/icon-symbol";

const MusicPlayer = () => {
  const { isPlaying, pause, play, currentTrack } = useAudioPlayerContext();

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

  const artists = currentTrack.artists.map((artist) => artist.name).join(", ");

  const coverUrl = getAlbumCoverUrl(currentTrack.album.id);

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <Image source={{ uri: coverUrl }} style={styles.albumArt} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {artists}
          </Text>
        </View>
      </View>
      <Pressable onPress={handlePlayTrack}>
        <IconSymbol
          size={28}
          name={isPlaying ? "pause.fill" : "play.fill"}
          color={"black"}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    marginHorizontal: 16,
    borderTopColor: "#e0e0e0",
  },
  leftContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontWeight: 700,
    fontSize: 16,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  artist: {
    fontSize: 12,
    color: "#666",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
});

export default MusicPlayer;
