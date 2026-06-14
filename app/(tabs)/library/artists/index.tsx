import { useArtists } from "@/api/queries/artists";
import ArtistItem from "@/components/reusable/artistItem";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Artists = () => {
  const { data: artistData } = useArtists();
  const { colors } = useTheme();
  const router = useRouter();

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const artists = artistData?.pages.flatMap((page) => page) ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol size={20} name={"chevron.left"} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Artists</Text>
      </View>
      <View style={styles.contentContainer}>
        {artists.map((artist) => (
          <Pressable
            key={artist.id}
            onPress={() =>
              router.navigate(`/(tabs)/library/artists/${artist.id}`)
            }
          >
            <ArtistItem id={artist.id} />
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

export default Artists;
