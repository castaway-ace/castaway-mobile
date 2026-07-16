import { IconSymbol } from "@/components/ui/iconSymbol";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { PlaylistType } from "@/types/playlist";
import { presignedImageSource } from "@/utils/images";
import { buildPlaylistCover } from "@/utils/playlist";
import { Image } from "expo-image";
import { FC, useMemo, useState } from "react";
import {
  ImageStyle,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

const ALBUM_PLACEHOLDER = require("../../assets/placeholders/album-placeholder.png");

/** Heart size as a share of the cover's width. */
const HEART_SCALE = 0.5;

interface PlaylistCoverProps {
  urls: string[] | undefined;
  style: StyleProp<ImageStyle & ViewStyle>;
  /** Omit for playlists whose type is unknown or irrelevant; only `LIKED` changes the artwork. */
  type?: PlaylistType;
}

/**
 * Playlist artwork: the Liked Songs heart mark, a single cover, a 2x2 tile grid,
 * or a placeholder. Shared by the playlist screen, list items, and the
 * add-to-playlist sheet.
 *
 * @remarks
 * Liked Songs gets a fixed identity mark rather than album tiles, so the one
 * system-managed playlist stays recognizable and its artwork doesn't churn as
 * songs are liked. Branching here rather than at the call sites keeps every
 * surface consistent for free — all four already route through this component.
 */
const PlaylistCover: FC<PlaylistCoverProps> = ({ urls, style, type }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [heartSize, setHeartSize] = useState(0);

  // Measured rather than fixed: covers range from 100px rows to a percentage
  // width on the playlist screen, so the only way the heart scales with all of
  // them is to read the laid-out width.
  const onLayout = (event: LayoutChangeEvent) =>
    setHeartSize(Math.round(event.nativeEvent.layout.width * HEART_SCALE));

  if (type === PlaylistType.LIKED) {
    return (
      <View style={[style, styles.likedCover]} onLayout={onLayout}>
        {/* Renders at size 0 until the first layout pass measures the cover. */}
        <IconSymbol name="heart.fill" size={heartSize} color={colors.onAccent} />
      </View>
    );
  }

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

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
    likedCover: {
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
  });

export default PlaylistCover;
