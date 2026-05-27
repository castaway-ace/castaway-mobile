import AlbumItem from "@/components/home/album-item";
import ArtistItem from "@/components/home/artist-item";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAlbums } from "../../api/queries/albums";
import { useArtists } from "../../api/queries/artists";
import { useTracks } from "../../api/queries/tracks";
import TrackItem from "../../components/home/track-item";
import { useAudioPlayerContext } from "../../contexts/audio-player-context";

const HomeScreen = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: favoriteTracksData } = useTracks({ starred: true });
  const { data: albumsData } = useAlbums();
  const { data: favoriteArtistsData } = useArtists({ starred: true });

  const { loadTrack } = useAudioPlayerContext();

  const albums = albumsData?.pages.flatMap((page) => page) ?? [];
  const favoriteTracks =
    favoriteTracksData?.pages.flatMap((page) => page) ?? [];
  const favoriteArtists =
    favoriteArtistsData?.pages.flatMap((page) => page) ?? [];

  const albumsAvailable = albums.length > 0;
  const favoriteTracksAvailable = favoriteTracks.length > 0;
  const favoriteArtistsAvailable = favoriteArtists.length > 0;

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
              {favoriteTracksAvailable ? (
                favoriteTracks
                  .slice(0, 6)
                  .map((track) => (
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
              Favorite Artists
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.artistScrollContent}
            >
              {favoriteArtistsAvailable ? (
                favoriteArtists.map((artist) => (
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

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    containerContent: {
      paddingBottom: 48,
    },
    itemsContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
    },
    itemsContainerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      paddingHorizontal: 16,
      color: colors.primary,
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
      color: colors.primary,
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
  });

export default HomeScreen;
