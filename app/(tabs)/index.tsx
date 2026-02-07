import { TrackItem } from "@/components/trackItem";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { useTracks } from "@/queries/tracks";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { data } = useTracks();
  const { loadTrack, pause, isPlaying, play } = useAudioPlayerContext();

  const tracks = data?.pages.flatMap((page) => page.data) ?? [];

  if (tracks.length === 0) return <Text>No tracks found</Text>;

  const handlePlayTrack = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const onTrackPress = (trackId: string) => {
    loadTrack(trackId);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <View style={styles.filterSection}>
        <Text>{tracks.length} Tracks</Text>
      </View>
      {tracks.map((track) => (
        <TrackItem
          key={track.id}
          track={track}
          onPress={() => onTrackPress(track.id)}
        />
      ))}
      <Button title={isPlaying ? "Pause" : "Play"} onPress={handlePlayTrack} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filterSection: {
    display: "flex",
    marginBottom: 8,
  },
});
