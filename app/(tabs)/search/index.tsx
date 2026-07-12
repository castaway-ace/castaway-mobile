import { useSearch } from "@/api/search/queries";
import SearchItem from "@/components/media/searchItem";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { useDebouncedValue } from "@/utils/useDebouncedValue";
import { useOrganizedSearch } from "@/utils/search";
import { router } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAlbums } from "@/api/albums/queries";
import { useUpdateAlbumInteraction } from "@/api/interactions/mutations";
import AlbumItem from "@/components/media/albumItem";

/**
 * Search tab: a query box that shows discovery content when empty and live
 * results as the user types.
 *
 * @remarks
 * The input is debounced by 300ms before it drives the query, so a request fires
 * only once the user pauses rather than on every keystroke. Two modes swap on
 * whether the box has text: empty shows a "Discover Albums" shelf, non-empty
 * shows the flattened results from {@link useOrganizedSearch}.
 */
const Search = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  // Debounce so typing doesn't fire a request per keystroke; the query runs
  // ~300ms after the user stops.
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const { data: searchData } = useSearch(debouncedSearch);

  const { data: albumsData } = useAlbums({ starred: true });

  const { mutate: albumInteraction } = useUpdateAlbumInteraction();

  const albums = albumsData?.pages.flatMap((page) => page) ?? [];

  const onAlbumPress = (albumId: string) => {
    albumInteraction(albumId);
    router.navigate(`/(tabs)/search/albums/${albumId}`);
  };

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const search = useOrganizedSearch(searchData);

  const tabBarHeight = useBottomTabBarHeight();

  const isInputted = searchInput.length > 0;
  const albumsAvailable = !!albums.length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.search}
            placeholder="What do you want to listen to?"
            placeholderTextColor={colors.primary}
            value={searchInput}
            onChangeText={setSearchInput}
          />
        </View>
      </View>
      {!isInputted && albumsAvailable && (
        <View style={styles.itemsContainer}>
          <Text style={[styles.itemsContainerTitle]}>Discover Albums</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.albumScrollContent}
          >
            {albums.map((album) => (
              <Pressable key={album.id} onPress={() => onAlbumPress(album.id)}>
                <AlbumItem id={album.id} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
      {isInputted && (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: tabBarHeight + 24,
          }}
          keyboardDismissMode="on-drag"
        >
          <View style={styles.searchItemContainer}>
            {search.map((data) => {
              return <SearchItem key={`${data.type}-${data.id}`} item={data} />;
            })}
          </View>
        </ScrollView>
      )}
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
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.primary,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      marginBottom: 16,
      borderColor: colors.accent,
      backgroundColor: colors.secondary,
    },
    search: {
      flex: 1,
      paddingVertical: 8,
      color: colors.primary,
    },
    searchItemContainer: {
      display: "flex",
      gap: 20,
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
    albumScrollContent: {
      display: "flex",
      flexDirection: "row",
      gap: 16,
      paddingHorizontal: 16,
    },
  });

export default Search;
