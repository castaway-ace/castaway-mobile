import { useAlbum, useAlbumCover } from "@/api/albums/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { blurHash } from "@/constants/blur";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface AlbumProps {
  id: string;
}

/**
 * Album card (cover, title, artists) for horizontal shelves and grids.
 *
 * @remarks
 * Self-fetching: takes only an `id` and loads its own album and cover through the
 * cached queries, so callers render lists from a list of ids without threading
 * full album objects (or cover URLs) down. Cover art comes from a separate query
 * than the metadata, so the two fill in independently.
 */
const AlbumItem: FC<AlbumProps> = ({ id }) => {
  const { colors } = useTheme();
  const { data: album, isLoading } = useAlbum(id);
  const { data: albumArtUrl } = useAlbumCover(id);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (isLoading) return <AlbumItemSkeleton />;

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
        {album?.artists?.map((artist) => artist.name)?.join(", ")}
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

/**
 * Loading placeholder for {@link AlbumItem}. Dimensions mirror the real card
 * (160-wide, square cover, two text lines) so swapping in the content doesn't
 * shift layout. Exported so shelves can render a row of these while their list
 * query loads.
 */
export const AlbumItemSkeleton = () => (
  <View style={{ width: 160, gap: 8 }}>
    <Skeleton width="100%" height={160} borderRadius={12} />
    <Skeleton width="80%" height={16} borderRadius={4} />
    <Skeleton width="55%" height={14} borderRadius={4} />
  </View>
);

export default AlbumItem;
