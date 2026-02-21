import { TrackItem } from "@/components/trackItem";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { useTracks } from "@/queries/tracks";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { data } = useTracks();
  const { loadTrack } = useAudioPlayerContext();

  const tracks = data?.pages.flatMap((page) => page.data) ?? [];

  if (tracks.length === 0) return <Text>No tracks found</Text>;

  const onTrackPress = (trackId: string) => {
    loadTrack(trackId);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Favorite Tracks</Text>
      </View>
      {tracks.map((track) => (
        <TrackItem
          key={track.id}
          track={track}
          onPress={() => onTrackPress(track.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filterSection: {
    display: "flex",
    padding: 16,
  },
  filterSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
