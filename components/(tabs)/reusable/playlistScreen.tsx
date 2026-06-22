import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { SheetType, useSheetModal } from "@/contexts/sheet-modal-context";
import { useTheme } from "@/contexts/theme-context";
import { buildPlaylistCover } from "@/utils/playlist";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { FC, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePlaylist, usePlaylistTracks } from "../../../api/queries/playlist";
import { IconSymbol } from "../../ui/icon-symbol";

interface PlaylistScreenProps {
  id: string;
}

const PlaylistScreen: FC<PlaylistScreenProps> = ({ id }) => {
  const { data: playlist } = usePlaylist(id);
  const { data: playlistTracks } = usePlaylistTracks(id);

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { open } = useSheetModal();

  const { playQueue } = useAudioPlayerContext();

  const tabBarHeight = useBottomTabBarHeight();

  const tiles = buildPlaylistCover(playlist?.albumCoverUrls);

  const areTilesPresent = tiles.length > 0;

  const onTrackPress = (index: number) => {
    if (!playlistTracks) return;
    playQueue(playlistTracks, index);
  };

  const onOptionPress = () => {
    if (!playlist) return;
    open({ type: SheetType.PLAYLIST, id: playlist?.id });
  };

  const onTrackOptionPress = (trackId: string) => {
    if (!playlist) return;
    open({ type: SheetType.PLAYLIST_TRACK, id: playlist?.id, trackId });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: tabBarHeight + 84,
        }}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol size={32} name={"chevron.left"} color={colors.primary} />
        </Pressable>
        <View style={styles.playlistArtContainer}>
          {!areTilesPresent && (
            <Image
              source={require("../../../assets/placeholders/album-placeholder.png")}
              style={styles.playlistArt}
            />
          )}
          {areTilesPresent && (
            <View style={styles.playlistArt}>
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
          )}
        </View>
        <View style={styles.playlistInfoContainer}>
          <Text style={styles.playlistTitle}>{playlist?.name}</Text>
          <Pressable onPress={onOptionPress}>
            <IconSymbol name={"ellipsis"} size={32} color={colors.primary} />
          </Pressable>
        </View>
        <View style={styles.trackContainer}>
          <Text style={styles.trackHeader}>Tracks</Text>
          {playlistTracks?.map((playlistTrack, index) => {
            return (
              <Pressable
                key={playlistTrack.id}
                style={styles.trackItem}
                onPress={() => onTrackPress(index)}
              >
                <View style={styles.trackInfo}>
                  <View style={styles.trackLeftInfo}>
                    <Text style={styles.trackTitle}>{playlistTrack.title}</Text>
                    <Text style={styles.trackArtists}>
                      {playlistTrack?.artists
                        ?.map((artist) => artist.name)
                        ?.join(", ")}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => onTrackOptionPress(playlistTrack.trackId)}
                  >
                    <IconSymbol
                      name={"ellipsis"}
                      size={32}
                      color={colors.primary}
                    />
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </View>
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
    scrollContainer: {
      paddingHorizontal: 16,
    },
    backButton: {
      position: "absolute",
      left: 4,
    },
    playlistArtContainer: {
      display: "flex",
      alignItems: "center",
      marginBottom: 24,
    },
    playlistArt: {
      width: "60%",
      aspectRatio: 800 / 800,
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
    playlistInfoContainer: {
      display: "flex",
      gap: 8,
      marginBottom: 24,
    },
    playlistTitle: {
      color: colors.primary,
      fontSize: 22,
      fontWeight: 500,
    },
    artistName: {
      color: colors.primary,
      fontSize: 16,
    },
    releaseDate: {
      color: colors.secondary,
      fontSize: 16,
    },
    trackContainer: {
      display: "flex",
      gap: 16,
    },
    trackHeader: {
      color: colors.primary,
      fontSize: 18,
    },
    trackItem: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    trackNumber: {
      color: colors.primary,
      fontSize: 18,
    },
    trackInfo: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    trackLeftInfo: {
      display: "flex",
      gap: 4,
    },
    trackTitle: {
      color: colors.primary,
      fontSize: 18,
    },
    trackArtists: {
      color: colors.secondary,
      fontSize: 16,
    },
  });

export default PlaylistScreen;
