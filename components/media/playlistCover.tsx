import { presignedImageSource } from "@/utils/images";
import { buildPlaylistCover } from "@/utils/playlist";
import { Image } from "expo-image";
import { FC } from "react";
import {
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

const ALBUM_PLACEHOLDER = require("../../assets/placeholders/album-placeholder.png");

interface PlaylistCoverProps {
  urls: string[] | undefined;
  style: StyleProp<ImageStyle & ViewStyle>;
}

/**
 * Playlist artwork: a single cover, a 2x2 tile grid, or a placeholder depending
 * on how many album covers the playlist has. Shared by the playlist screen,
 * list items, and the add-to-playlist sheet.
 */
const PlaylistCover: FC<PlaylistCoverProps> = ({ urls, style }) => {
  const tiles = buildPlaylistCover(urls);

  if (tiles.length === 0) {
    return <Image source={ALBUM_PLACEHOLDER} style={style} />;
  }

  return (
    <View style={[style, styles.grid]}>
      {tiles.map((url, index) => {
        const source = presignedImageSource(url);
        return (
          <Image
            key={`${source.cacheKey}-${index}`}
            source={source}
            cachePolicy="memory-disk"
            style={tiles.length === 1 ? styles.full : styles.mini}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    overflow: "hidden",
  },
  full: {
    width: "100%",
    height: "100%",
  },
  mini: {
    width: "50%",
    height: "50%",
  },
});

export default PlaylistCover;
