import { useTracks } from "@/api/queries/tracks";
import TrackItem from "@/components/(tabs)/track-item";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Tracks = () => {
  const { data: trackData } = useTracks();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const tracks = trackData?.pages.flatMap((page) => page) ?? [];

  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Pressable onPress={() => router.navigate("/library")}>
        <Text style={{ color: colors.primary }}>Go Back</Text>
      </Pressable>
      <Text style={styles.title}>Tracks</Text>
      <View>
        {tracks.map((track) => (
          <TrackItem key={track.id} track={track} onPress={() => {}} />
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

export default Tracks;
