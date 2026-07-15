import {
    useUpdateAlbumInteraction,
    useUpdateArtistInteraction,
    useUpdatePlaylistInteraction,
} from "@/api/interactions/mutations";
import { useLibrary } from "@/api/library/queries";
import LibraryItem from "@/components/media/libraryItem";
import { LibraryItemSkeleton } from "@/components/media/skeletons";
import { IconSymbol } from "@/components/ui/iconSymbol";
import { ThemeColors } from "@/constants/theme";
import { usePopupModal } from "@/contexts/popupModalContext";
import { useTheme } from "@/contexts/themeContext";
import { LibraryItem as LibraryItemData, LibraryItemType } from "@/types/library";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Library tab: everything the user has collected — their playlists (Liked Songs
 * included) plus every album and artist they've favorited — as one list ordered
 * by how recently each was opened, with a create-playlist action in the header.
 *
 * @remarks
 * The list arrives assembled, ordered, and with artwork resolved from
 * {@link useLibrary}, so this screen owns only presentation and navigation.
 * Tapping a row records an interaction before navigating, which both keeps
 * recency fresh and re-sorts the list on return. Routes stay under `/library` so
 * detail screens land in this tab's stack.
 */
const Library = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();

  const tabBarHeight = useBottomTabBarHeight();

  const { data: items, isLoading } = useLibrary();

  const { openCreatePlaylist } = usePopupModal();

  const { mutate: albumInteraction } = useUpdateAlbumInteraction();
  const { mutate: artistInteraction } = useUpdateArtistInteraction();
  const { mutate: playlistInteraction } = useUpdatePlaylistInteraction();

  const itemsAvailable = !!items?.length;

  const onItemPress = (item: LibraryItemData) => {
    if (item.type === LibraryItemType.ALBUM) {
      albumInteraction(item.album.id);
      router.navigate(`/(tabs)/library/albums/${item.album.id}`);
    } else if (item.type === LibraryItemType.ARTIST) {
      artistInteraction(item.artist.id);
      router.navigate(`/(tabs)/library/artists/${item.artist.id}`);
    } else {
      playlistInteraction(item.playlist.id);
      router.navigate(`/(tabs)/library/playlists/${item.playlist.id}`);
    }
  };

  // The union has no shared id field, so key on the entity the row points at.
  const itemKey = (item: LibraryItemData) => {
    if (item.type === LibraryItemType.ALBUM) return `album-${item.album.id}`;
    if (item.type === LibraryItemType.ARTIST) return `artist-${item.artist.id}`;
    return `playlist-${item.playlist.id}`;
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
        {isLoading && (
          <View style={styles.itemContainer}>
            {[0, 1, 2, 3, 4].map((i) => (
              <LibraryItemSkeleton key={i} />
            ))}
          </View>
        )}
        {itemsAvailable && (
          <View style={styles.itemContainer}>
            {items.map((item) => {
              return (
                <Pressable key={itemKey(item)} onPress={() => onItemPress(item)}>
                  <LibraryItem item={item} />
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
