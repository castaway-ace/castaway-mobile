import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { Interaction, InteractionType } from "@/types/interactions";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import PlaylistCover from "./playlistCover";

type InteractionVariant = "grid" | "row";

interface InteractionItemProps {
  interaction: Interaction;
  variant?: InteractionVariant;
}

const ARTIST_PLACEHOLDER = require("../../assets/placeholders/artist-placeholder.png");
const ALBUM_PLACEHOLDER = require("../../assets/placeholders/album-placeholder.png");

const InteractionItem: FC<InteractionItemProps> = ({
  interaction,
  variant = "grid",
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors, variant), [colors, variant]);
  const isAlbum = interaction.type === InteractionType.ALBUM;
  const isArtist = interaction.type === InteractionType.ARTIST;
  const isPlaylist = interaction.type === InteractionType.PLAYLIST;

  const placeholder = isArtist ? ARTIST_PLACEHOLDER : ALBUM_PLACEHOLDER;

  const text = isAlbum
    ? interaction.album.title
    : isArtist
      ? interaction.artist.name
      : interaction.playlist.name;

  const subText = isAlbum
    ? interaction.artists.map((artist) => artist.name).join(", ")
    : isArtist
      ? "Artist"
      : "Playlist";

  const renderImage = () => {
    if (isPlaylist) {
      return (
        <PlaylistCover
          urls={interaction.coverUrls}
          style={styles.interactionArt}
        />
      );
    }
    return (
      <Image
        source={interaction.coverUrl ?? placeholder}
        style={styles.interactionArt}
      />
    );
  };

  return (
    <View key={interaction.id} style={styles.interactionItem}>
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

const makeStyles = (colors: ThemeColors, variant: InteractionVariant) =>
  StyleSheet.create({
    interactionItem:
      variant === "grid"
        ? { width: 160, gap: 12 }
        : { flexDirection: "row", gap: 16 },
    interactionArt: {
      width: variant === "grid" ? "100%" : 100,
      aspectRatio: 1,
      borderRadius: 12,
    },
    textContainer: {
      gap: 4,
      ...(variant === "row" ? { justifyContent: "center" as const } : {}),
    },
    text: {
      fontSize: variant === "grid" ? 16 : 18,
      fontWeight: "bold",
      maxWidth: "100%",
      color: colors.primary,
    },
    subText: {
      fontSize: 16,
      maxWidth: "100%",
      color: colors.secondary,
    },
  });

export default InteractionItem;
