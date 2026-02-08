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

  const artists = currentTrack.artists
    .map((artist) => artist.artist.name)
    .join(", ");

  return (
    <View style={styles.container}>
      <Image source={{ uri: currentTrack.albumUrl }} style={styles.albumArt} />
      <View style={styles.info}>
        <Text style={styles.title}>{currentTrack.title}</Text>
        <Text style={styles.artist}>{artists}</Text>
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
    height: 80,
    gap: 12,
    backgroundColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  title: {
    marginRight: 16,
  },
  albumArt: {
    width: 40,
    height: 40,
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
