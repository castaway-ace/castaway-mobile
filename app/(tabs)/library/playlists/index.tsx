import { usePlaylists } from "@/api/queries/playlist";
import PlaylistItem from "@/components/reusable/playlistItem";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Playlists = () => {
  const { data: playlists } = usePlaylists();
  const { colors } = useTheme();
  const router = useRouter();

  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol size={20} name={"chevron.left"} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Playlists</Text>
      </View>
      <View style={styles.contentContainer}>
        {playlists?.map((playlist) => (
          <Pressable
            key={playlist.id}
            onPress={() =>
              router.navigate(`/(tabs)/library/playlists/${playlist.id}`)
            }
          >
            <PlaylistItem key={playlist.id} playlist={playlist} />
          </Pressable>
        ))}
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
    header: {
      display: "flex",
      flexDirection: "row",
      gap: 8,
      alignItems: "baseline",
      marginBottom: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.primary,
    },
    contentContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
  });

export default Playlists;
