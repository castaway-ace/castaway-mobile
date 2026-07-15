import { useAlbums } from "@/api/albums/queries";
import { useArtists } from "@/api/artists/queries";
import { useSeedInteractionArtwork } from "@/api/interactions/cache";
import {
  useUpdateAlbumInteraction,
  useUpdateArtistInteraction,
  useUpdatePlaylistInteraction,
} from "@/api/interactions/mutations";
import { useInteractions } from "@/api/interactions/queries";
import { usePlaylists } from "@/api/playlists/queries";
import AlbumItem from "@/components/media/albumItem";
import ArtistItem from "@/components/media/artistItem";
import InteractionItem from "@/components/media/interactionItem";
import PlaylistItem from "@/components/media/playlistItem";
import {
  AlbumItemSkeleton,
  ArtistItemSkeleton,
  InteractionItemSkeleton,
  PlaylistItemSkeleton,
  SkeletonShelf,
} from "@/components/media/skeletons";
import { ThemeColors } from "@/constants/theme";
import {
  CONTENT_BOTTOM_GAP,
  useBottomInset,
} from "@/contexts/bottomInsetContext";
import { useTheme } from "@/contexts/themeContext";
import { Interaction, InteractionType } from "@/types/interactions";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Home tab: horizontally-scrolling shelves of favorite albums, playlists,
 * recently played, and favorite artists.
 *
 * @remarks
 * Each shelf is conditionally rendered only when it has content, so empty
 * sections don't leave gaps. Tapping any item records an interaction before
 * navigating (keeping recency fresh), and routes are built under `/home` so
 * detail screens stay in this tab's stack.
 */
const HomeScreen = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: playlistData, isLoading: playlistsLoading } = usePlaylists();
  const { data: favoriteAlbumsData, isLoading: albumsLoading } = useAlbums({
    starred: true,
  });
  const { data: favoriteArtistsData, isLoading: artistsLoading } = useArtists({
    starred: true,
  });
  const { data: interactions, isLoading: interactionsLoading } =
    useInteractions();

  const { mutate: albumInteraction } = useUpdateAlbumInteraction();
  const { mutate: artistInteraction } = useUpdateArtistInteraction();
  const { mutate: playlistInteraction } = useUpdatePlaylistInteraction();

  const seedInteractionArtwork = useSeedInteractionArtwork();

  const favoriteAlbums =
    favoriteAlbumsData?.pages.flatMap((page) => page) ?? [];
  const favoriteArtists =
    favoriteArtistsData?.pages.flatMap((page) => page) ?? [];

  const playlists = playlistData?.pages.flatMap((page) => page) ?? [];

  const playlistsAvailable = !!playlists?.length;
  const interactionsAvailable = !!interactions?.length;
  const favoriteAlbumsAvailable = !!favoriteAlbums.length;
  const favoriteArtistsAvailable = !!favoriteArtists.length;

  const { bottomInset } = useBottomInset();

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

  // Route a recently-played tile to the matching detail screen based on its type.
  const onInteractionPress = (interaction: Interaction) => {
    // Hand the feed's artwork to the screen we're about to open, which otherwise
    // refetches a URL we already have and renders empty until it lands.
    seedInteractionArtwork(interaction);

    if (interaction.type === InteractionType.ALBUM) {
      onAlbumPress(interaction.album.id);
    } else if (interaction.type === InteractionType.ARTIST) {
      onArtistPress(interaction.artist.id);
    } else {
      onPlaylistPress(interaction.playlist.id);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        testID="home-scroll"
        contentContainerStyle={{
          paddingBottom: bottomInset + CONTENT_BOTTOM_GAP,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.itemContainerWrapper}>
          {albumsLoading && (
            <SkeletonShelf>
              {[0, 1, 2].map((i) => (
                <AlbumItemSkeleton key={i} />
              ))}
            </SkeletonShelf>
          )}
          {favoriteAlbumsAvailable && (
            <View style={styles.itemsContainer}>
              <Text style={[styles.itemsContainerTitle]}>Favorite Albums</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.albumScrollContent}
              >
                {favoriteAlbums.map((album) => {
                  return (
                    <Pressable
                      key={album.id}
                      onPress={() => onAlbumPress(album.id)}
                    >
                      <AlbumItem id={album.id} />
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
          {playlistsLoading && (
            <SkeletonShelf>
              {[0, 1, 2].map((i) => (
                <PlaylistItemSkeleton key={i} />
              ))}
            </SkeletonShelf>
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
                    <PlaylistItem id={playlist.id} />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
          {interactionsLoading && (
            <SkeletonShelf>
              {[0, 1, 2].map((i) => (
                <InteractionItemSkeleton key={i} variant="grid" />
              ))}
            </SkeletonShelf>
          )}
          {interactionsAvailable && (
            <View style={styles.itemsContainer}>
              <Text style={[styles.itemsContainerTitle]}>Recents</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.albumScrollContent}
              >
                {interactions.map((interaction) => {
                  return (
                    <Pressable
                      key={interaction.id}
                      onPress={() => onInteractionPress(interaction)}
                    >
                      <InteractionItem
                        interaction={interaction}
                        variant="grid"
                      />
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
          {artistsLoading && (
            <SkeletonShelf>
              {[0, 1, 2].map((i) => (
                <ArtistItemSkeleton key={i} />
              ))}
            </SkeletonShelf>
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
    itemContainerWrapper: {
      display: "flex",
      flexDirection: "column",
      gap: 32,
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
