import { TrackItem } from "@/components/trackItem";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { useTrack, useTracks } from "@/queries/tracks";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { data } = useTracks();
  const { data: track } = useTrack("ae2fc12c-355c-4f98-8b90-9bfeb44d5ff1");
  const { loadTrack, pause, isPlaying, currentTrack, play } =
    useAudioPlayerContext();

  const tracks = data?.pages.flatMap((page) => page.data) ?? [];

  if (tracks.length === 0) return <Text>No tracks found</Text>;

  const handlePlayTrack = () => {
    if (track?.stream?.url) {
      if (isPlaying && currentTrack?.id === track.id) {
        pause();
      } else {
        loadTrack(track.id, track.stream.url, track.title);
        setTimeout(() => play(), 100);
      }
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <View style={styles.filterSection}>
        <Text>{tracks.length} Tracks</Text>
      </View>
      {tracks.map((track) => (
        <TrackItem key={track.id} track={track} />
      ))}
      <Button
        title={isPlaying && currentTrack?.id === track?.id ? "Pause" : "Play"}
        onPress={handlePlayTrack}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filterSection: {
    display: "flex",
    marginBottom: 8,
  },
});
