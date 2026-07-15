import { blurHash } from "@/constants/blur";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import {
  LibraryItem as LibraryItemData,
  LibraryItemType,
} from "@/types/library";
import { presignedImageSource } from "@/utils/images";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import PlaylistCover from "./playlistCover";

interface LibraryItemProps {
  item: LibraryItemData;
}

const ARTIST_PLACEHOLDER = require("../../assets/placeholders/artist-placeholder.png");
const ALBUM_PLACEHOLDER = require("../../assets/placeholders/album-placeholder.png");

/**
 * Renders one row of the library list, which mixes playlists, albums, and
 * artists.
 *
 * @remarks
 * The library union carries a different payload per `type`, so title, subtitle,
 * placeholder, and artwork are each resolved by branching on it — notably
 * playlists use the tiled {@link PlaylistCover} while albums and artists render
 * a single image. One component handles all three so the list can render a
 * heterogeneous feed uniformly. Mirrors {@link InteractionItem}, which does the
 * same for the interactions feed.
 *
 * Self-contained: the endpoint bundles the artwork, so unlike {@link AlbumItem}
 * and friends this fetches nothing.
 */
const LibraryItem: FC<LibraryItemProps> = ({ item }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const isAlbum = item.type === LibraryItemType.ALBUM;
  const isArtist = item.type === LibraryItemType.ARTIST;
  const isPlaylist = item.type === LibraryItemType.PLAYLIST;

  const text = isAlbum
    ? item.album.title
    : isArtist
      ? item.artist.name
      : item.playlist.name;

  const subText = isAlbum
    ? `Album • ${item.artists.map((artist) => artist.name).join(", ")}`
    : isArtist
      ? "Artist"
      : "Playlist";

  const renderImage = () => {
    if (isPlaylist) {
      return <PlaylistCover urls={item.coverUrls} style={styles.art} />;
    }

    const placeholder = isArtist ? ARTIST_PLACEHOLDER : ALBUM_PLACEHOLDER;

    return (
      <Image
        source={
          item.coverUrl ? presignedImageSource(item.coverUrl) : placeholder
        }
        placeholder={blurHash}
        cachePolicy="memory-disk"
        style={styles.art}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderImage()}
      <View style={styles.textContainer}>
        <Text style={styles.text} numberOfLines={1}>
          {text}
        </Text>
        <Text style={styles.subText} numberOfLines={1}>
          {subText}
        </Text>
      </View>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: 16,
    },
    art: {
      width: 100,
      aspectRatio: 1,
      borderRadius: 12,
    },
    textContainer: {
      flex: 1,
      gap: 4,
      justifyContent: "center",
    },
    text: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primary,
    },
    subText: {
      fontSize: 16,
      color: colors.secondary,
    },
  });

export default LibraryItem;
