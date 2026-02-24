import { TrackItem } from "@/components/trackItem";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { useAlbums } from "@/queries/albums";
import { useTracks } from "@/queries/tracks";
import { Album } from "@/types/albums";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  const { data: trackData } = useTracks();
  const { data: albumData } = useAlbums();
  const { loadTrack } = useAudioPlayerContext();

  const albums: Album[] = albumData?.data ?? [];
  const tracks = trackData?.pages.flatMap((page) => page.data) ?? [];

  const albumsAvailable = albums.length > 0;
  const tracksAvailable = tracks.length > 0;

  const onTrackPress = (trackId: string) => {
    loadTrack(trackId);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.tracksContainer}>
          <Text style={styles.tracksContainerTitle}>Favorite Tracks</Text>
          {tracksAvailable ? (
            tracks.map((track) => (
              <TrackItem
                key={track.id}
                track={track}
                onPress={() => onTrackPress(track.id)}
              />
            ))
          ) : (
            <Text style={styles.noTracksText}>No tracks found</Text>
          )}
        </View>
        <View style={styles.albumsContainer}>
          <Text style={styles.albumsContainerTitle}>Rediscover Albums</Text>
          {albumsAvailable ? (
            albums.map((album) => <Text key={album.id}>{album.title}</Text>)
          ) : (
            <Text style={styles.noAlbumsText}>No albums found</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  tracksContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  tracksContainerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  noTracksText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
  },
  albumsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  albumsContainerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  noAlbumsText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
  },
});

export default HomeScreen;
