import { BASE_URL } from "@/api/client";
import { useArtistCover } from "@/api/queries/artists";
import { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { Artist } from "@/types/artists";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface ArtistItemProps {
  artist: Artist;
}

const ArtistItem: FC<ArtistItemProps> = ({ artist }) => {
  const { colors } = useTheme();
  const { accessToken } = useAuth();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: artistCover } = useArtistCover(artist.id);
  return (
    <View key={artist.id} style={styles.artistItem}>
      <Image
        source={{
          uri: `${BASE_URL}/artists/${artist.id}/stream`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }}
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
      backgroundColor: colors.secondary,
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      gap: 8,
      width: 240,
      height: 72,
      borderRadius: 12,
    },
    artistArt: {
      width: 48,
      height: 48,
      borderRadius: 32,
    },
    artistName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
    },
  });

export default ArtistItem;
