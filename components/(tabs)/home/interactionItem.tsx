import { albumApi } from "@/api/albums";
import { artistApi } from "@/api/artists";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { Interaction, InteractionType } from "@/types/interactions";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { blurHash } from "../../../constants/blur";

interface InteractionItemProps {
  interaction: Interaction;
}

const IMAGE_PLACEHOLDER = require("../../../assets/placeholders/artist-placeholder.png");

const HomeInteractionItem: FC<InteractionItemProps> = ({ interaction }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isAlbum = interaction.type === InteractionType.ALBUM;
  const isArtist = interaction.type === InteractionType.ARTIST;

  const { data: source } = useQuery({
    queryKey: isAlbum
      ? ["albumCover", interaction.albumId]
      : isArtist
        ? ["artistImage", interaction.artistId]
        : ["interaction-image", "none"],
    queryFn: () => {
      if (isAlbum) {
        return albumApi.getCover(interaction.albumId);
      }
      if (isArtist) {
        return artistApi.getImage(interaction.artistId);
      }
      return null;
    },
    enabled: Boolean(isAlbum || isArtist),
  });

  const text = isAlbum
    ? interaction.album.title
    : isArtist
      ? interaction.artist.name
      : interaction.playlist.name;

  const subText = isAlbum
    ? interaction.album.albumArtists.map(
        (albumArtist) => albumArtist.artist?.name,
      )
    : isArtist
      ? "Artist"
      : "Playlist";

  return (
    <View key={interaction.id} style={styles.interactionItem}>
      <Image
        source={source ?? IMAGE_PLACEHOLDER}
        placeholder={blurHash}
        style={styles.interactionArt}
      />
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
    interactionItem: {
      width: 160,
      gap: 12,
    },
    interactionArt: {
      width: "100%",
      aspectRatio: 1,
      borderRadius: 12,
    },
    textContainer: {
      gap: 4,
    },
    text: {
      fontSize: 16,
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

export default HomeInteractionItem;
