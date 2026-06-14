import { useAlbums } from "@/api/queries/albums";
import { useArtists } from "@/api/queries/artists";
import { usePlaylists } from "@/api/queries/playlist";
import HomeInteractionItem from "@/components/(tabs)/home/interactionItem";
import AlbumItem from "@/components/reusable/albumItem";
import ArtistItem from "@/components/reusable/artistItem";
import PlaylistItem from "@/components/reusable/playlistItem";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { Interaction, InteractionType } from "@/types/interactions";
import { router } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useUpdateAlbumInteraction,
  useUpdateArtistInteraction,
  useUpdatePlaylistInteraction,
} from "../../../api/mutations/interactions";
import { useInteractions } from "../../../api/queries/interactions";

const HomeScreen = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: playlists } = usePlaylists();
  const { data: favoriteAlbumsData } = useAlbums({ starred: true });
  const { data: favoriteArtistsData } = useArtists({ starred: true });
  const { data: interactions } = useInteractions();

  const { mutate: albumInteraction } = useUpdateAlbumInteraction();
  const { mutate: artistInteraction } = useUpdateArtistInteraction();
  const { mutate: playlistInteraction } = useUpdatePlaylistInteraction();

  const favoriteAlbums =
    favoriteAlbumsData?.pages.flatMap((page) => page) ?? [];
  const favoriteArtists =
    favoriteArtistsData?.pages.flatMap((page) => page) ?? [];

  const playlistsAvailable = !!playlists?.length;
  const interactionsAvailable = !!interactions?.length;
  const favoriteAlbumsAvailable = !!favoriteAlbums.length;
  const favoriteArtistsAvailable = !!favoriteArtists.length;

  const tabBarHeight = useBottomTabBarHeight();

  const onAlbumPress = (albumId: string) => {
    albumInteraction(albumId);
    router.navigate(`/(tabs)/home/albums/${albumId}`);
  };

  const onArtistPress = (artistId: string) => {
    artistInteraction(artistId);
    router.navigate(`/(tabs)/home/artists/${artistId}`);
  };

  const onPlaylistPress = (playlistId: string) => {
    playlistInteraction(playlistId);
    router.navigate(`/(tabs)/home/playlists/${playlistId}`);
  };

  const onInteractionPress = (interaction: Interaction) => {
    if (interaction.type === InteractionType.ALBUM) {
      onAlbumPress(interaction.albumId);
    } else if (interaction.type === InteractionType.ARTIST) {
      onArtistPress(interaction.artistId);
    } else {
      onPlaylistPress(interaction.playlistId);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}>
        <View style={styles.itemContainerWrapper}>
          {favoriteAlbumsAvailable && (
            <View style={styles.itemsContainer}>
              <Text style={[styles.itemsContainerTitle]}>Favorite Albums</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.albumScrollContent}
              >
                {favoriteAlbums.map((album) => (
                  <Pressable
                    key={album.id}
                    onPress={() => onAlbumPress(album.id)}
                  >
                    <AlbumItem id={album.id} />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
          {playlistsAvailable && (
            <View style={styles.itemsContainer}>
              <Text style={[styles.itemsContainerTitle]}>Your Playlists</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.albumScrollContent}
              >
                {playlists.map((playlist) => (
                  <Pressable
                    key={playlist.id}
                    onPress={() => onPlaylistPress(playlist.id)}
                  >
                    <PlaylistItem playlist={playlist} />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
          {interactionsAvailable && (
            <View style={styles.itemsContainer}>
              <Text style={[styles.itemsContainerTitle]}>Recently Played</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.albumScrollContent}
              >
                {interactions.map((interaction) => (
                  <Pressable
                    key={interaction.id}
                    onPress={() => onInteractionPress(interaction)}
                  >
                    <HomeInteractionItem interaction={interaction} />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
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
                    onPress={() => onArtistPress(artist.id)}
                  >
                    <ArtistItem id={artist.id} />
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
      paddingTop: 16,
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
