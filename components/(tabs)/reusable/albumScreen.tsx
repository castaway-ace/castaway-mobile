import { useAlbumCover } from "@/api/queries/albums";
import { blurHash } from "@/constants/blur";
import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { SheetType, useSheetModal } from "@/contexts/sheet-modal-context";
import { useTheme } from "@/contexts/theme-context";
import { formatDate } from "@/utils/formatters";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { FC, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAlbumStar } from "../../../api/mutations/albums";
import { useStarredTracks } from "../../../api/queries/tracks";
import { Album } from "../../../types/albums";
import { IconSymbol } from "../../ui/icon-symbol";

interface AlbumScreenProps {
  album: Album;
  onArtistPress: (artistId: string) => void;
}

const AlbumScreen: FC<AlbumScreenProps> = ({ album, onArtistPress }) => {
  const { data: starredTracks } = useStarredTracks();
  const { mutate: albumStar } = useAlbumStar();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: albumCoverUrl } = useAlbumCover(album.id);
  const { open } = useSheetModal();
  const releaseDate = formatDate(album?.releaseDate);

  const { playQueue } = useAudioPlayerContext();

  const tabBarHeight = useBottomTabBarHeight();

  const onTrackPress = (index: number) => {
    if (!album?.tracks) return;
    playQueue(album.tracks, index);
  };

  const onLikeAlbumButtonPress = () => {
    if (!album) return;
    albumStar({ id: album.id, starred: !!album.starred });
  };

  const onOptionPress = (trackId: string) => {
    open({ type: SheetType.ALBUM, id: album.id, trackId });
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
        <View style={styles.albumArtContainer}>
          <Image
            source={{
              uri: albumCoverUrl,
            }}
            placeholder={blurHash}
            style={styles.albumArt}
          />
        </View>
        <View style={styles.albumInfoContainer}>
          <Text style={styles.albumTitle}>{album?.title}</Text>
          <View>
            {album?.artists.map((artist) => {
              return (
                <Pressable
                  key={artist.id}
                  onPress={() => onArtistPress(artist.id)}
                >
                  <Text style={styles.artistName}>{artist.name}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.releaseDate}>Album • {releaseDate}</Text>
        </View>
        <View style={styles.albumLikeContainer}>
          <Pressable onPress={onLikeAlbumButtonPress}>
            <IconSymbol
              name={album?.starred ? "heart.fill" : "heart"}
              size={32}
              color={colors.primary}
            />
          </Pressable>
        </View>
        <View style={styles.trackContainer}>
          <Text style={styles.trackHeader}>Tracks</Text>
          {album?.tracks?.map((track, index) => {
            return (
              <Pressable
                key={track.id}
                style={styles.trackItem}
                onPress={() => onTrackPress(index)}
              >
                <Text style={styles.trackNumber}>{track.trackNumber}</Text>
                <View style={styles.trackInfo}>
                  <View style={styles.trackLeftInfo}>
                    <Text style={styles.trackTitle}>{track.title}</Text>
                    <Text style={styles.trackArtists}>
                      {track?.artists?.map((artist) => artist.name)?.join(", ")}
                    </Text>
                  </View>
                  <Pressable onPress={() => onOptionPress(track.id)}>
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
    albumArtContainer: {
      display: "flex",
      alignItems: "center",
      marginBottom: 24,
    },
    albumArt: {
      width: "60%",
      aspectRatio: 800 / 800,
      borderRadius: 8,
    },
    albumInfoContainer: {
      display: "flex",
      gap: 8,
      marginBottom: 24,
    },
    albumLikeContainer: {
      marginBottom: 24,
    },
    albumTitle: {
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
      width: 24,
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

export default AlbumScreen;
