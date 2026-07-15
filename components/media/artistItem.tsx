import { useArtist, useArtistImage } from "@/api/artists/queries";
import { ArtistItemSkeleton } from "@/components/media/skeletons";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { presignedImageSource } from "@/utils/images";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { blurHash } from "@/constants/blur";

interface ArtistItemProps {
  id: string;
}

/**
 * Circular artist card (image, name) for artist shelves.
 *
 * @remarks
 * Self-fetching from `id`, mirroring {@link AlbumItem}. Falls back to a bundled
 * placeholder when the artist has no image so the circle is never empty.
 */
const ArtistItem: FC<ArtistItemProps> = ({ id }) => {
  const { colors } = useTheme();
  const { data: artist, isLoading } = useArtist(id);
  const { data: artistImageUrl } = useArtistImage(id);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (isLoading) return <ArtistItemSkeleton />;

  const imageSource = artistImageUrl
    ? presignedImageSource(artistImageUrl)
    : require("../../assets/placeholders/artist-placeholder.png");

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
