import { useArtist, useArtistImage } from "@/api/artists/queries";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { blurHash } from "../../../constants/blur";

interface ArtistItemProps {
  id: string;
}

const ArtistItem: FC<ArtistItemProps> = ({ id }) => {
  const { colors } = useTheme();
  const { data: artist } = useArtist(id);
  const { data: artistImageUrl } = useArtistImage(id);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const imageSource = artistImageUrl
    ? {
        uri: artistImageUrl,
      }
    : require("../../../assets/placeholders/artist-placeholder.png");

  return (
    <View style={styles.artistItem}>
      <Image
        source={imageSource}
        placeholder={blurHash}
        style={styles.artistArt}
      />
      <Text style={styles.artistName}>{artist?.name}</Text>
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
