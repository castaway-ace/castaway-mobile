import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Library = () => {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Library</Text>
      <ScrollView>
        <View style={styles.grid}>
          <View style={styles.row}>
            <TouchableOpacity style={styles.libraryItem}>
              <IconSymbol name="music.note" size={24} color="black" />
              <Text>Tracks</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.libraryItem}>
              <IconSymbol name="square.stack.fill" size={24} color="black" />
              <Text>Albums</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.libraryItem}>
              <IconSymbol name="person.fill" size={24} color="black" />
              <Text>Artists</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.libraryItem}>
              <IconSymbol name="music.note.list" size={24} color="black" />
              <Text>Playlists</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  libraryItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
  },
  grid: {
    gap: 16,
  },
});

export default Library;
