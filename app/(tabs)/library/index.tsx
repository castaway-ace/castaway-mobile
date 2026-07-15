import {
  useUpdateAlbumInteraction,
  useUpdateArtistInteraction,
  useUpdatePlaylistInteraction,
} from "@/api/interactions/mutations";
import { useLibrary } from "@/api/library/queries";
import LibraryItem from "@/components/media/libraryItem";
import { LibraryItemSkeleton } from "@/components/media/skeletons";
import FilterPill from "@/components/ui/filterPill";
import { IconSymbol } from "@/components/ui/iconSymbol";
import { ThemeColors } from "@/constants/theme";
import { usePopupModal } from "@/contexts/popupModalContext";
import { useTheme } from "@/contexts/themeContext";
import {
  LibraryItem as LibraryItemData,
  LibraryItemType,
} from "@/types/library";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Library tab: everything the user has collected — their playlists (Liked Songs
 * included) plus every album and artist they've favorited — as one list ordered
 * by how recently each was opened, filterable by type.
 *
 * @remarks
 * The list arrives assembled, ordered, filtered, and with artwork resolved from
 * {@link useLibrary}, so this screen owns only presentation and navigation.
 * Tapping a row records an interaction before navigating, which both keeps
 * recency fresh and re-sorts the list on return. Routes stay under `/library` so
 * detail screens land in this tab's stack.
 *
 * The header sits outside the `ScrollView`, so the title and pills stay put
 * while the list scrolls beneath them.
 */
const Library = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();

  const tabBarHeight = useBottomTabBarHeight();

  // Held here rather than in the URL: the tab stays mounted, so the choice
  // survives visiting a detail screen and coming back, which is what you want
  // when the filter is how you found the item in the first place.
  const [filter, setFilter] = useState<LibraryItemType | null>(null);

  const {
    data: items,
    isLoading,
    isPlaceholderData,
  } = useLibrary({ type: filter ?? undefined });

  const { openCreatePlaylist } = usePopupModal();

  const { mutate: albumInteraction } = useUpdateAlbumInteraction();
  const { mutate: artistInteraction } = useUpdateArtistInteraction();
  const { mutate: playlistInteraction } = useUpdatePlaylistInteraction();

  const itemsAvailable = !!items?.length;

  // `isLoading` is only true before anything has ever loaded — `keepPreviousData`
  // reports success while a filter is in flight — so this covers the first paint
  // alone and switching filters never falls back to skeletons.
  const showSkeletons = isLoading;

  // `isPlaceholderData` is true precisely while showing another filter's list,
  // when `items` says nothing about the filter now selected. Without that guard
  // this flashes the wrong "no X in your library" for a round trip.
  const showEmpty = !isLoading && !isPlaceholderData && items?.length === 0;

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
      <View style={styles.filterRow}>
        {filter && (
          <FilterPill
            icon="xmark"
            active
            onPress={() => setFilter(null)}
            accessibilityLabel="Clear filter"
            testID="library-filter-clear"
          />
        )}
        {FILTERS.filter(({ type }) => !filter || filter === type).map(
          ({ type, label }) => (
            <FilterPill
              key={type}
              label={label}
              active={filter === type}
              onPress={() => setFilter(type)}
              testID={`library-filter-${type}`}
            />
          ),
        )}
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 84 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {showSkeletons && (
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
                <Pressable
                  key={itemKey(item)}
                  onPress={() => onItemPress(item)}
                >
                  <LibraryItem item={item} />
                </Pressable>
              );
            })}
          </View>
        )}
        {showEmpty && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {filter ? EMPTY_MESSAGES[filter] : "Your library is empty"}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

/** The filter pills, in the order they appear. */
const FILTERS: readonly { type: LibraryItemType; label: string }[] = [
  { type: LibraryItemType.PLAYLIST, label: "Playlists" },
  { type: LibraryItemType.ALBUM, label: "Albums" },
  { type: LibraryItemType.ARTIST, label: "Artists" },
];

/** Shown when a filter matches nothing; the active filter picks the wording. */
const EMPTY_MESSAGES: Record<LibraryItemType, string> = {
  [LibraryItemType.PLAYLIST]: "No playlists in your library",
  [LibraryItemType.ALBUM]: "No albums in your library",
  [LibraryItemType.ARTIST]: "No artists in your library",
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
    filterRow: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 16,
      marginBottom: 16,
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
    // Lets the empty state center in the leftover space; a no-op once the list
    // is long enough to scroll.
    scrollContent: {
      flexGrow: 1,
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      fontSize: 16,
      color: colors.secondary,
    },
  });

export default Library;
