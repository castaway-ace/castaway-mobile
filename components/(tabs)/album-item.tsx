import { BASE_URL } from "@/api/client";
import { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { AlbumSummary } from "@/types/albums";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface AlbumProps {
  album: AlbumSummary;
}

const AlbumItem: FC<AlbumProps> = ({ album }) => {
  const { colors } = useTheme();
  const { accessToken } = useAuth();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.albumContainer}>
      <Image
        source={{
          uri: `${BASE_URL}/albums/${album.id}/stream`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }}
        style={styles.albumArt}
      />
      <Text style={styles.albumName}>{album.title}</Text>
      <Text style={styles.albumArtist}>
        {album.artists.map((artist) => artist).join(", ")}
      </Text>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    albumContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    albumArt: {
      width: 160,
      height: 160,
      borderRadius: 8,
    },
    albumName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
    },
    albumArtist: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.secondary,
    },
  });

export default AlbumItem;
