import {
  useUpdateAlbumInteraction,
  useUpdateArtistInteraction,
  useUpdatePlaylistInteraction,
} from "@/api/mutations/interactions";
import { useInteractions } from "@/api/queries/interactions";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { Interaction, InteractionType } from "@/types/interactions";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LibraryInteractionItem from "../../../components/(tabs)/library/interactionItem";

const Library = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();

  const { data: interactions } = useInteractions();

  const { mutate: albumInteraction } = useUpdateAlbumInteraction();
  const { mutate: artistInteraction } = useUpdateArtistInteraction();
  const { mutate: playlistInteraction } = useUpdatePlaylistInteraction();

  const interactionsAvailable = !!interactions?.length;

  const onAlbumPress = (albumId: string) => {
    albumInteraction(albumId);
    router.navigate(`/(tabs)/library/albums/${albumId}`);
  };

  const onArtistPress = (artistId: string) => {
    artistInteraction(artistId);
    router.navigate(`/(tabs)/library/artists/${artistId}`);
  };

  const onPlaylistPress = (playlistId: string) => {
    playlistInteraction(playlistId);
    router.navigate(`/(tabs)/library/playlists/${playlistId}`);
  };

  const onInteractionPress = (interaction: Interaction) => {
    if (interaction.type === InteractionType.ALBUM) {
      onAlbumPress(interaction.albumId);
    } else if (interaction.type === InteractionType.ARTIST) {
      onArtistPress(interaction.artistId);
    } else {
      onPlaylistPress(interaction.playlistId);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Library</Text>
      {interactionsAvailable && (
        <View style={styles.itemContainer}>
          {interactions.map((interaction) => {
            return (
              <Pressable
                key={interaction.id}
                onPress={() => onInteractionPress(interaction)}
              >
                <LibraryInteractionItem interaction={interaction} />
              </Pressable>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    itemContainer: {
      gap: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.primary,
    },
  });

export default Library;
