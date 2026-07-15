import {
    useUpdateAlbumInteraction,
    useUpdateArtistInteraction,
    useUpdatePlaylistInteraction,
} from "@/api/interactions/mutations";
import { useSeedInteractionArtwork } from "@/api/interactions/cache";
import { useInteractions } from "@/api/interactions/queries";
import { IconSymbol } from "@/components/ui/iconSymbol";
import { ThemeColors } from "@/constants/theme";
import { usePopupModal } from "@/contexts/popupModalContext";
import { useTheme } from "@/contexts/themeContext";
import { Interaction, InteractionType } from "@/types/interactions";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InteractionItem from "@/components/media/interactionItem";
import { InteractionItemSkeleton } from "@/components/media/skeletons";

/**
 * Library tab: a vertical list of the user's recent items plus a create-playlist
 * action.
 *
 * @remarks
 * Renders the same interaction feed as Home but in the full-width `row` variant.
 * The header's "+" opens the create-playlist popup. Like Home, it records an
 * interaction before navigating and keeps routes under `/library`.
 */
const Library = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();

  const tabBarHeight = useBottomTabBarHeight();

  const { data: interactions, isLoading: interactionsLoading } =
    useInteractions();

  const { openCreatePlaylist } = usePopupModal();

  const { mutate: albumInteraction } = useUpdateAlbumInteraction();
  const { mutate: artistInteraction } = useUpdateArtistInteraction();
  const { mutate: playlistInteraction } = useUpdatePlaylistInteraction();

  const seedInteractionArtwork = useSeedInteractionArtwork();

  const interactionsAvailable = !!interactions?.length;

  const onAlbumPress = (albumId: string) => {
    albumInteraction(albumId);
    router.navigate(`/(tabs)/library/albums/${albumId}`);
  };

  const onArtistPress = (artistId: string) => {
    artistInteraction(artistId);
    router.navigate(`/(tabs)/library/artists/${artistId}`);
  };

  const onPlaylistPress = (playlistId: string) => {
    playlistInteraction(playlistId);
    router.navigate(`/(tabs)/library/playlists/${playlistId}`);
  };

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

  const onPlaylistCreatePress = () => {
    openCreatePlaylist();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Pressable onPress={onPlaylistCreatePress}>
          <IconSymbol size={28} name={"plus"} color={colors.primary} />
        </Pressable>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 84 }}
        showsVerticalScrollIndicator={false}
      >
        {interactionsLoading && (
          <View style={styles.itemContainer}>
            {[0, 1, 2, 3, 4].map((i) => (
              <InteractionItemSkeleton key={i} variant="row" />
            ))}
          </View>
        )}
        {interactionsAvailable && (
          <View style={styles.itemContainer}>
            {interactions.map((interaction) => {
              return (
                <Pressable
                  key={interaction.id}
                  onPress={() => onInteractionPress(interaction)}
                >
                  <InteractionItem interaction={interaction} variant="row" />
                </Pressable>
              );
            })}
          </View>
        )}
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
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingRight: 16,
    },
    itemContainer: {
      gap: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.primary,
      paddingHorizontal: 16,
    },
    scrollView: {
      paddingHorizontal: 16,
    },
  });

export default Library;
