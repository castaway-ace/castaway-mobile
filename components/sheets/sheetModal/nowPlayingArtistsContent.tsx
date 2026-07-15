import { artistImageQueryOptions } from "@/api/artists/queries";
import { useUpdateArtistInteraction } from "@/api/interactions/mutations";
import { blurHash } from "@/constants/blur";
import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { usePlayerModal } from "@/contexts/playerModalContext";
import { useSheetModal } from "@/contexts/sheetModalContext";
import { useTheme } from "@/contexts/themeContext";
import { presignedImageSource } from "@/utils/images";
import { useTabLocation } from "@/utils/useTabLocation";
import { useQueries } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { FC, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const artistPlaceholder = require("../../../assets/placeholders/artist-placeholder.png");

/**
 * Artist picker for the currently-playing track, opened by tapping the player's
 * artist line when a track credits more than one artist.
 *
 * @remarks
 * Only reachable for multi-artist tracks — the player navigates straight to the
 * artist when there's just one, so this sheet never renders a single-row list.
 * Like {@link NowPlayingContent} it's launched from over the player, so picking
 * an artist has to dismiss *two* layers (`close` and `closePlayer`) before
 * navigating, or the destination is left buried underneath them.
 */
const NowPlayingArtistsContent: FC = () => {
  const { close } = useSheetModal();
  const { close: closePlayer } = usePlayerModal();
  const { currentTrack } = useAudioPlayerContext();
  const location = useTabLocation();

  const { mutate: artistInteraction } = useUpdateArtistInteraction();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const artists = useMemo(() => currentTrack?.artists ?? [], [currentTrack]);

  const artistImages = useQueries({
    queries: artists.map((artist) => artistImageQueryOptions(artist.id)),
  });

  if (!currentTrack) return null;

  const onArtistPress = (artistId: string) => {
    close();
    closePlayer();
    artistInteraction(artistId);
    router.navigate(`/(tabs)/${location}/artists/${artistId}`);
  };

  return (
    <View style={styles.container}>
      {artists.map((artist, i) => {
        const imageUrl = artistImages[i]?.data;
        return (
          <Pressable
            key={artist.id}
            style={styles.spacing}
            onPress={() => onArtistPress(artist.id)}
          >
            <Image
              source={
                imageUrl ? presignedImageSource(imageUrl) : artistPlaceholder
              }
              placeholder={blurHash}
              style={styles.artistArt}
            />
            <View style={styles.artistInfo}>
              <Text style={styles.artistName}>{artist.name}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    spacing: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      padding: 16,
    },
    artistArt: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    artistInfo: {
      flex: 1,
      gap: 4,
    },
    artistName: {
      color: colors.primary,
      fontSize: 18,
    },
  });

export default NowPlayingArtistsContent;
