import { TrackItem } from "@/components/home/track-item";
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

  const sampleAlbums = [
    {
      id: "1",
      name: "Album 1",
      imageUrl: "https://picsum.photos/200/300",
      artistName: "Artist 1",
    },
    {
      id: "2",
      name: "Album 2",
      imageUrl: "https://picsum.photos/200/300",
      artistName: "Artist 2",
    },
    {
      id: "3",
      name: "Album 3",
      imageUrl: "https://picsum.photos/200/300",
      artistName: "Artist 3",
    },
    {
      id: "4",
      name: "Album 4",
      imageUrl: "https://picsum.photos/200/300",
      artistName: "Artist 4",
    },
    {
      id: "5",
      name: "Album 5",
      imageUrl: "https://picsum.photos/200/300",
      artistName: "Artist 5",
    },
  ];

  const sampleImageUrl = "https://picsum.photos/200/300";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <View style={styles.itemContainerWrapper}>
          <View style={[styles.itemsContainer, styles.paddingHorizontal]}>
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
            <Text
              style={[styles.itemsContainerTitle, { paddingHorizontal: 16 }]}
            >
              Rediscover Albums
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.albumScrollContent}
            >
              {albumsAvailable ? (
                sampleAlbums.map((album) => (
                  <View key={album.id}>
                    <Image
                      source={{ uri: sampleImageUrl }}
                      style={styles.albumArt}
                    />
                    <Text>{album.name}</Text>
                    <Text>{album.artistName}</Text>
                  </View>
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
              Last Played Albums
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.albumScrollContent}
            >
              {albumsAvailable ? (
                sampleAlbums.map((album) => (
                  <View key={album.id}>
                    <Image
                      source={{ uri: sampleImageUrl }}
                      style={styles.albumArt}
                    />
                    <Text>{album.name}</Text>
                    <Text>{album.artistName}</Text>
                  </View>
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
                  <View key={artist.id}>
                    <Image
                      source={{ uri: sampleImageUrl }}
                      style={styles.artistArt}
                    />
                    <Text>{artist.name}</Text>
                  </View>
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
    width: 160,
    height: 160,
    borderRadius: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 64,
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
  albumScrollContent: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
  },
  paddingHorizontal: {
    padding: 16,
  },
  artistScrollContent: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
  },
});

export default HomeScreen;
