import { IconSymbol } from "@/components/ui/icon-symbol";
import { StyleSheet, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Search = () => {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Search</Text>
      <TextInput style={styles.search} placeholder="Search">
        <IconSymbol name="magnifyingglass" size={24} color="black" />
      </TextInput>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  search: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#f0f0f0",
  },
});

export default Search;
