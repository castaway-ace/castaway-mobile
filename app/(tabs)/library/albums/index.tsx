import { useAlbums } from "@/api/queries/albums";
import AlbumItem from "@/components/reusable/albumItem";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Albums = () => {
  const { data: albumData } = useAlbums();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const albums = albumData?.pages.flatMap((page) => page) ?? [];

  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol size={20} name={"chevron.left"} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Albums</Text>
      </View>
      <View>
        {albums.map((album) => (
          <Pressable
            key={album.id}
            onPress={() =>
              router.navigate(`/(tabs)/library/albums/${album.id}`)
            }
          >
            <AlbumItem album={album} />
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
  });

export default Albums;
