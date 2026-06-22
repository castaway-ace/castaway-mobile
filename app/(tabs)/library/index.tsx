import {
  useUpdateAlbumInteraction,
  useUpdateArtistInteraction,
  useUpdatePlaylistInteraction,
} from "@/api/mutations/interactions";
import { useInteractions } from "@/api/queries/interactions";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemeColors } from "@/constants/theme";
import { usePopupModal } from "@/contexts/popup-modal.context";
import { useTheme } from "@/contexts/theme-context";
import { Interaction, InteractionType } from "@/types/interactions";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import LibraryInteractionItem from "../../../components/(tabs)/library/interactionItem";

const Library = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();

  const tabBarHeight = useBottomTabBarHeight();

  const { data: interactions } = useInteractions();

  const { open } = usePopupModal();

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
      onAlbumPress(interaction.album.id);
    } else if (interaction.type === InteractionType.ARTIST) {
      onArtistPress(interaction.artist.id);
    } else {
      onPlaylistPress(interaction.playlist.id);
    }
  };

  const onPlaylistCreatePress = () => {
    open();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Pressable onPress={onPlaylistCreatePress}>
          <IconSymbol size={28} name={"plus"} color={colors.primary} />
        </Pressable>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingRight: 16,
    },
    itemContainer: {
      gap: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.primary,
      paddingHorizontal: 16,
    },
    scrollView: {
      paddingHorizontal: 16,
    },
  });

export default Library;
