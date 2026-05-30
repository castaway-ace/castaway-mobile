import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Library = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Library</Text>
      <ScrollView>
        <View style={styles.grid}>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.libraryItem}
              onPress={() => router.navigate("/library/tracks")}
            >
              <IconSymbol name="music.note" size={24} color="black" />
              <Text>Tracks</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.libraryItem}
              onPress={() => router.navigate("/library/albums")}
            >
              <IconSymbol name="square.stack.fill" size={24} color="black" />
              <Text>Albums</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.libraryItem}
              onPress={() => router.navigate("/library/artists")}
            >
              <IconSymbol name="person.fill" size={24} color="black" />
              <Text>Artists</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.libraryItem}
              onPress={() => router.navigate("/library/playlists")}
            >
              <IconSymbol name="music.note.list" size={24} color="black" />
              <Text>Playlists</Text>
            </TouchableOpacity>
          </View>
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
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.primary,
    },
    libraryItem: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 16,
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 8,
      color: colors.secondary,
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
