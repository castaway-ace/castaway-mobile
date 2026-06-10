import { useAlbums } from "@/api/queries/albums";
import { useArtists } from "@/api/queries/artists";
import { usePlaylists } from "@/api/queries/playlist";
import AlbumItem from "@/components/reusable/albumItem";
import ArtistItem from "@/components/reusable/artistItem";
import PlaylistItem from "@/components/reusable/playlistItem";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: playlists } = usePlaylists();
  const { data: favoriteAlbumsData } = useAlbums({ starred: true });
  const { data: favoriteArtistsData } = useArtists({ starred: true });
  const { data: albumsData } = useAlbums();

  const albums = albumsData?.pages.flatMap((page) => page) ?? [];
  const favoriteAlbums =
    favoriteAlbumsData?.pages.flatMap((page) => page) ?? [];
  const favoriteArtists =
    favoriteArtistsData?.pages.flatMap((page) => page) ?? [];

  const playlistsAvailable = playlists?.length;
  const albumsAvailable = albums.length > 0;
  const favoriteAlbumsAvailable = favoriteAlbums.length > 0;
  const favoriteArtistsAvailable = favoriteArtists.length > 0;

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
                    <Pressable
                      key={album.id}
                      onPress={() =>
                        router.navigate(`/(tabs)/home/albums/${album.id}`)
                      }
                    >
                      <AlbumItem album={album} />
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            </View>
          )}
          <View style={styles.itemsContainer}>
            <Text style={[styles.itemsContainerTitle]}>Playlists</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.albumScrollContent}
            >
              {playlistsAvailable ? (
                playlists.map((playlist) => (
                  <Pressable
                    key={playlist.id}
                    onPress={() =>
                      router.navigate(
                        `/(tabs)/library/playlists/${playlist.id}`,
                      )
                    }
                  >
                    <PlaylistItem playlist={playlist} />
                  </Pressable>
                ))
              ) : (
                <Text style={styles.unavailableText}>No playlists found</Text>
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
                  <Pressable
                    key={album.id}
                    onPress={() =>
                      router.navigate(`/(tabs)/home/albums/${album.id}`)
                    }
                  >
                    <AlbumItem album={album} />
                  </Pressable>
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
                  <Pressable
                    key={artist.id}
                    onPress={() =>
                      router.navigate(`/(tabs)/home/artists/${artist.id}`)
                    }
                  >
                    <ArtistItem artist={artist} />
                  </Pressable>
                ))}
              </ScrollView>
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
