import { TrackItem } from "@/components/trackItem";
import { useTracks } from "@/services/useTracks";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { data, isLoading, isError, error } = useTracks();
  if (isError) return <Text>{error?.toString()}</Text>;
  if (isLoading) return <Text>Loading...</Text>;

  const tracks = data?.pages.flatMap((page) => page.data) ?? [];

  if (tracks.length === 0) return <Text>No tracks found</Text>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <View style={styles.filterSection}>
        <Text>
          {tracks.length} Tracks
        </Text>
      </View>
      {tracks.map((track) => (
        <TrackItem key={track.id} track={track} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filterSection: {
    display: "flex",
    marginBottom: 8,
  },
});
