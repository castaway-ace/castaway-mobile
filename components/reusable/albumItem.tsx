import { useAlbum, useAlbumCover } from "@/api/queries/albums";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { blurHash } from "../../constants/blur";

interface AlbumProps {
  albumId: string;
}

const AlbumItem: FC<AlbumProps> = ({ albumId }) => {
  const { colors } = useTheme();
  const { data: album } = useAlbum(albumId);
  const { data: albumArtUrl } = useAlbumCover(albumId);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.albumContainer}>
      <Image
        source={{
          uri: albumArtUrl,
        }}
        placeholder={blurHash}
        style={styles.albumArt}
      />
      <Text style={styles.albumName} numberOfLines={1}>
        {album?.title}
      </Text>
      <Text style={styles.albumArtist} numberOfLines={1}>
        {album?.artists.map((artist) => artist).join(", ")}
      </Text>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    albumContainer: {
      width: 160,
      gap: 8,
    },
    albumArt: {
      width: "100%",
      aspectRatio: 1,
      borderRadius: 12,
    },
    albumName: {
      fontSize: 16,
      fontWeight: "bold",
      maxWidth: "100%",
      color: colors.primary,
    },
    albumArtist: {
      fontSize: 14,
      fontWeight: "500",
      maxWidth: "100%",
      color: colors.secondary,
    },
  });

export default AlbumItem;
