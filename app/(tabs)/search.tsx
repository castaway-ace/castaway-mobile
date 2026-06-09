import { useSearch } from "@/api/queries/search";
import SearchItem from "@/components/(tabs)/search/item";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useOrganizedSearch } from "@/utils/search";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Search = () => {
  const [searchInput, setSearchInput] = useState<string>("");

  const { data: searchData } = useSearch(searchInput);

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const search = useOrganizedSearch(searchData);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Search</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search"
          placeholderTextColor={colors.primary}
          value={searchInput}
          onChangeText={setSearchInput}
        />
      </View>
      <View style={styles.searchItemContainer}>
        {search.map((data) => {
          return <SearchItem key={data.text} item={data} />;
        })}
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
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
      color: colors.primary,
    },
    searchItemContainer: {
      display: "flex",
      gap: 16,
    },
  });

export default Search;
