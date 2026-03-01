import { TrackItem } from "@/components/home/track-item";
import { getAlbumCoverUrl } from "@/config/api";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { useAlbums } from "@/queries/albums";
import { useArtists } from "@/queries/artists";
import { useTracks } from "@/queries/tracks";
import { Album } from "@/types/albums";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  const {
    data: trackData,
    isLoading: tracksLoading,
    isError: tracksError,
  } = useTracks();

  const {
    data: albumData,
    isLoading: albumsLoading,
    isError: albumsError,
  } = useAlbums();

  const {
    data: artistData,
    isLoading: artistsLoading,
    isError: artistsError,
  } = useArtists();

  const { loadTrack } = useAudioPlayerContext();

  const albums: Album[] = albumData?.data ?? [];
  const tracks = trackData?.pages.flatMap((page) => page.data) ?? [];
  const artists = artistData?.pages.flatMap((page) => page.data) ?? [];

  const albumsAvailable = albums.length > 0;
  const tracksAvailable = tracks.length > 0;
  const artistsAvailable = artists.length > 0;

  const onTrackPress = (trackId: string) => {
    loadTrack(trackId);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <View style={styles.itemContainerWrapper}>
          <View style={styles.itemsContainer}>
            <Text style={styles.itemsContainerTitle}>Favorite Tracks</Text>
            {tracksAvailable ? (
              tracks.map((track) => (
                <TrackItem
                  key={track.id}
                  track={track}
                  onPress={() => onTrackPress(track.id)}
                />
              ))
            ) : (
              <Text style={styles.unavailableText}>No tracks found</Text>
            )}
          </View>
          <View style={styles.itemsContainer}>
            <Text style={styles.itemsContainerTitle}>Rediscover Albums</Text>
            {albumsAvailable ? (
              albums.map((album) => (
                <Image
                  key={album.id}
                  source={{ uri: getAlbumCoverUrl(album.id) }}
                  style={styles.albumArt}
                />
              ))
            ) : (
              <Text style={styles.unavailableText}>No albums found</Text>
            )}
          </View>
          <View style={styles.itemsContainer}>
            <Text style={styles.itemsContainerTitle}>Random Albums</Text>
            {albumsAvailable ? (
              albums.map((album) => (
                <Image
                  key={album.id}
                  source={{ uri: getAlbumCoverUrl(album.id) }}
                  style={styles.albumArt}
                />
              ))
            ) : (
              <Text style={styles.unavailableText}>No albums found</Text>
            )}
          </View>
          <View style={styles.itemsContainer}>
            <Text style={styles.itemsContainerTitle}>Random Artists</Text>
            {artistsAvailable ? (
              artists.map((artist) => (
                <Text key={artist.id}>{artist.name}</Text>
              ))
            ) : (
              <Text style={styles.unavailableText}>No artists found</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  albumArt: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  itemsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  itemsContainerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  itemContainerWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  unavailableText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default HomeScreen;
