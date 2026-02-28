import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Library = () => {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Library</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  filterSection: {
    display: "flex",
    padding: 16,
  },
  filterSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Library;
