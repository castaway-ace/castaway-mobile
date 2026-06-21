import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { Interaction, InteractionType } from "@/types/interactions";
import { buildPlaylistCover } from "@/utils/playlist";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface InteractionItemProps {
  interaction: Interaction;
}

const ARTIST_PLACEHOLDER = require("../../../assets/placeholders/artist-placeholder.png");
const ALBUM_PLACEHOLDER = require("../../../assets/placeholders/album-placeholder.png");

const HomeInteractionItem: FC<InteractionItemProps> = ({ interaction }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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
    ? interaction.artists.map((artist) => artist.name)
    : isArtist
      ? "Artist"
      : "Playlist";

  const ImageContent = () => {
    if (isPlaylist) {
      const tiles = buildPlaylistCover(interaction?.coverUrls);
      const areTilesPresent = tiles.length > 0;
      if (!areTilesPresent) {
        return (
          <Image
            source={require("../../../assets/placeholders/album-placeholder.png")}
            style={styles.interactionArt}
          />
        );
      }

      return (
        <View style={styles.interactionArt}>
          {tiles.map((url, index) => {
            return (
              <Image
                key={`${url}-${index}`}
                source={{ uri: url }}
                style={
                  tiles.length === 1
                    ? styles.playlistFullArt
                    : styles.playlistMiniArt
                }
              />
            );
          })}
        </View>
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
      <ImageContent />
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
      flexDirection: "row",
      flexWrap: "wrap",
      overflow: "hidden",
    },
    playlistFullArt: {
      width: "100%",
      height: "100%",
    },
    playlistMiniArt: {
      width: "50%",
      height: "50%",
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
