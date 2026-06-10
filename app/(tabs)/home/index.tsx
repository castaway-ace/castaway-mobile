import { AlbumOrder } from "@/api/albums";
import { useAlbums } from "@/api/queries/albums";
import { useArtists } from "@/api/queries/artists";
import { useTracks } from "@/api/queries/tracks";
import AlbumItem from "@/components/(tabs)/album-item";
import ArtistItem from "@/components/(tabs)/artist-item";
import TrackItem from "@/components/(tabs)/track-item";
import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { useTheme } from "@/contexts/theme-context";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: favoriteTracksData } = useTracks({ starred: true });
  const { data: favoriteAlbumsData } = useAlbums({ starred: true });
  const { data: recentlyAddedAlbumsData } = useAlbums({
    order: AlbumOrder.ADDED,
  });
  const { data: favoriteArtistsData } = useArtists({ starred: true });
  const { data: albumsData } = useAlbums();

  const { loadTrack } = useAudioPlayerContext();

  const albums = albumsData?.pages.flatMap((page) => page) ?? [];
  const recentlyAddedAlbums =
    recentlyAddedAlbumsData?.pages.flatMap((page) => page) ?? [];
  const favoriteAlbums =
    favoriteAlbumsData?.pages.flatMap((page) => page) ?? [];
  const favoriteTracks =
    favoriteTracksData?.pages.flatMap((page) => page) ?? [];
  const favoriteArtists =
    favoriteArtistsData?.pages.flatMap((page) => page) ?? [];

  const albumsAvailable = albums.length > 0;
  const recentlyAddedAlbumsAvailable = recentlyAddedAlbums.length > 0;
  const favoriteAlbumsAvailable = favoriteAlbums.length > 0;
  const favoriteTracksAvailable = favoriteTracks.length > 0;
  const favoriteArtistsAvailable = favoriteArtists.length > 0;

  const onTrackPress = (trackId: string) => {
    loadTrack(trackId);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.containerContent}>
        <View style={styles.itemContainerWrapper}>
          {favoriteAlbumsAvailable && (
            <View style={styles.itemsContainer}>
              <>
                <Text style={[styles.itemsContainerTitle]}>
                  Favorite Albums
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.albumScrollContent}
                >
                  {favoriteAlbums.map((album) => (
                    <AlbumItem album={album} key={album.id} />
                  ))}
                </ScrollView>
              </>
            </View>
          )}
          {favoriteTracksAvailable && (
            <View style={styles.itemsContainer}>
              <Text style={[styles.itemsContainerTitle]}>Favorite Tracks</Text>
              <View style={styles.trackListContainer}>
                {favoriteTracks.slice(0, 6).map((track) => (
                  <TrackItem
                    key={track.id}
                    track={track}
                    onPress={() => onTrackPress(track.id)}
                  />
                ))}
              </View>
            </View>
          )}
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
          {favoriteArtistsAvailable && (
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
                {favoriteArtists.map((artist) => (
                  <ArtistItem key={artist.id} artist={artist} />
                ))}
              </ScrollView>
            </View>
          )}
          {recentlyAddedAlbumsAvailable && (
            <View style={styles.itemsContainer}>
              <>
                <Text style={[styles.itemsContainerTitle]}>
                  Recently Added Albums
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.albumScrollContent}
                >
                  {recentlyAddedAlbums.map((album) => (
                    <AlbumItem album={album} key={album.id} />
                  ))}
                </ScrollView>
              </>
            </View>
          )}
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
