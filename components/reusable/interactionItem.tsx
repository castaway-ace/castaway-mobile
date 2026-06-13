import { albumApi } from "@/api/albums";
import { artistApi } from "@/api/artists";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { Interaction, InteractionType } from "@/types/interactions";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { blurHash } from "../../constants/blur";

interface InteractionItemProps {
  interaction: Interaction;
}

const IMAGE_PLACEHOLDER = require("../../assets/placeholders/artist-placeholder.png");

const InteractionItem: FC<InteractionItemProps> = ({ interaction }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isAlbum = interaction.type == InteractionType.ALBUM;
  const isArtist = interaction.type == InteractionType.ARTIST;

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

  console.log(interaction);

  const text = isAlbum
    ? interaction.album.title
    : isArtist
      ? interaction.artist.name
      : interaction.playlist.name;

  return (
    <View key={interaction.id} style={styles.interactionItem}>
      <Image
        source={source ?? IMAGE_PLACEHOLDER}
        placeholder={blurHash}
        style={styles.interactionArt}
      />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    interactionItem: {
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    interactionArt: {
      width: 120,
      height: 120,
      borderRadius: 12,
    },
    text: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
    },
  });

export default InteractionItem;
