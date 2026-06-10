import { useArtistImage } from "@/api/queries/artists";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { ArtistSummary } from "@/types/artists";
import { Image } from "expo-image";
import { router } from "expo-router";
import { FC, useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface ArtistItemProps {
  artist: ArtistSummary;
}

const ArtistItem: FC<ArtistItemProps> = ({ artist }) => {
  const { colors } = useTheme();
  const { data: artistImageUrl } = useArtistImage(artist.id);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable
      key={artist.id}
      style={styles.artistItem}
      onPress={() => router.navigate(`/(tabs)/home/artists/${artist.id}`)}
    >
      <Image
        source={{
          uri: artistImageUrl,
        }}
        style={styles.artistArt}
      />
      <Text style={styles.artistName}>{artist.name}</Text>
    </Pressable>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    artistItem: {
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    artistArt: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    artistName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
    },
  });

export default ArtistItem;
