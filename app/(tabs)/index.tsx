import AlbumItem from "@/components/home/album-item";
import ArtistItem from "@/components/home/artist-item";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAlbums } from "../../api/queries/albums";
import { useArtists } from "../../api/queries/artists";
import { useTracks } from "../../api/queries/tracks";
import { TrackItem } from "../../components/home/track-item";
import { useAudioPlayerContext } from "../../contexts/audio-player-context";

const HomeScreen = () => {
  const { data: trackData } = useTracks();

  const { data: albumData } = useAlbums();

  const { data: artistData } = useArtists();

  const { loadTrack } = useAudioPlayerContext();

  const albums = albumData?.pages.flatMap((page) => page) ?? [];
  const tracks = trackData?.pages.flatMap((page) => page) ?? [];
  const artists = artistData?.pages.flatMap((page) => page) ?? [];

  const albumsAvailable = albums.length > 0;
  const tracksAvailable = tracks.length > 0;
  const artistsAvailable = artists.length > 0;

  const onTrackPress = (trackId: string) => {
    loadTrack(trackId);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.containerContent}>
        <View style={styles.itemContainerWrapper}>
          <View style={styles.itemsContainer}>
            <Text style={[styles.itemsContainerTitle]}>Favorite Tracks</Text>
            <View style={styles.trackListContainer}>
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
          </View>
          <View style={styles.itemsContainer}>
            <Text style={[styles.itemsContainerTitle]}>Rediscover Albums</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.albumScrollContent}
            >
              {albumsAvailable ? (
                albums.map((album) => (
                  <AlbumItem album={album} key={album.id} />
                ))
              ) : (
                <Text style={styles.unavailableText}>No albums found</Text>
              )}
            </ScrollView>
          </View>
          <View style={styles.itemsContainer}>
            <Text style={[styles.itemsContainerTitle]}>Last Played Albums</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.albumScrollContent}
            >
              {albumsAvailable ? (
                albums.map((album) => (
                  <AlbumItem album={album} key={album.id} />
                ))
              ) : (
                <Text style={styles.unavailableText}>No albums found</Text>
              )}
            </ScrollView>
          </View>
          <View style={styles.itemsContainer}>
            <Text
              style={[styles.itemsContainerTitle, { paddingHorizontal: 16 }]}
            >
              Random Artists
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.artistScrollContent}
            >
              {artistsAvailable ? (
                artists.map((artist) => (
                  <ArtistItem key={artist.id} artist={artist} />
                ))
              ) : (
                <Text style={styles.unavailableText}>No artists found</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  albumArt: {
    width: 160,
    height: 160,
    borderRadius: 8,
  },
  artistArt: {
    width: 60,
    height: 60,
    borderRadius: 32,
  },
  containerContent: {
    paddingBottom: 48,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  itemsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  itemsContainerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 16,
  },
  trackListContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    paddingHorizontal: 16,
  },
  itemContainerWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 32,
  },
  unavailableText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  albumScrollContent: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
  },
  artistScrollContent: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
  },
  albumName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  albumArtist: {
    fontSize: 14,
    fontWeight: "500",
  },
  artistName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  artistItem: {
    display: "flex",
    backgroundColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 8,
    width: 240,
    height: 72,
    borderRadius: 12,
  },
});

export default HomeScreen;
