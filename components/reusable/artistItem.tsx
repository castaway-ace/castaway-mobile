import { useArtistImage } from "@/api/queries/artists";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { ArtistSummary } from "@/types/artists";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { blurHash } from "../../constants/blur";

interface ArtistItemProps {
  artist: ArtistSummary;
}

const ArtistItem: FC<ArtistItemProps> = ({ artist }) => {
  const { colors } = useTheme();
  const { data: artistImageUrl } = useArtistImage(artist.id);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View key={artist.id} style={styles.artistItem}>
      <Image
        source={{
          uri: artistImageUrl,
        }}
        placeholder={blurHash}
        style={styles.artistArt}
      />
      <Text style={styles.artistName}>{artist.name}</Text>
    </View>
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
