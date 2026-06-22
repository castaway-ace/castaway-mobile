import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import { FC, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useUpdateArtistInteraction } from "../../../api/mutations/interactions";
import { useTrackStar } from "../../../api/mutations/tracks";
import { useAlbumCover } from "../../../api/queries/albums";
import { useStarredTracks, useTrack } from "../../../api/queries/tracks";
import { blurHash } from "../../../constants/blur";
import { ThemeColors } from "../../../constants/theme";
import {
  SheetAlbumTrack,
  SheetType,
  useSheetModal,
} from "../../../contexts/sheet-modal-context";
import { useTheme } from "../../../contexts/theme-context";
import { IconSymbol } from "../../ui/icon-symbol";

const AlbumTrackContent: FC = () => {
  const { active, open, close } = useSheetModal();
  const trackInfo = active as SheetAlbumTrack;
  const { data: track } = useTrack(trackInfo.trackId);
  const pathname = usePathname();

  const { data: starredTracks } = useStarredTracks();
  const { data: albumArtUrl } = useAlbumCover(track?.album.id);

  const { mutate: artistInteraction } = useUpdateArtistInteraction();
  const { mutate: trackStar } = useTrackStar();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const inHome = pathname.startsWith("/home");
  const inLibrary = pathname.startsWith("/library");

  const location = inHome ? "home" : inLibrary ? "library" : "search";

  if (!track) return null;

  const starred = !!starredTracks?.includes(track.id);

  const onPlaylistPress = () => {
    open({ type: SheetType.PLAYLIST_SELECT, trackId: track.id });
  };

  const onLikedSongPress = () => {
    trackStar({ id: track.id, starred });
    close();
  };

  const onArtistPress = () => {
    const artistId = track.artists[0]?.id;
    if (!artistId) return;
    artistInteraction(artistId);
    router.navigate(`/(tabs)/${location}/artists/${artistId}`);
    close();
  };

  return (
    <View style={styles.container}>
      <View style={styles.trackInfo}>
        <View style={styles.spacing}>
          <Image
            source={{
              uri: albumArtUrl,
            }}
            placeholder={blurHash}
            style={styles.albumArt}
          />
          <View style={styles.trackLeftInfo}>
            <Text style={styles.trackTitle}>{track.title}</Text>
            <Text style={styles.trackArtists}>
              {track.artists.map((artist) => artist.name)?.join(", ")} •{" "}
              {track.album.title}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <Pressable style={styles.bottomButton} onPress={onPlaylistPress}>
          <IconSymbol size={28} name={"plus.circle"} color={colors.primary} />
          <Text style={styles.text}>Add to Playlist</Text>
        </Pressable>
        <Pressable style={styles.bottomButton} onPress={onLikedSongPress}>
          <IconSymbol
            size={28}
            name={starred ? "heart.fill" : "heart"}
            color={colors.primary}
          />
          <Text style={styles.text}>
            {starred ? "Remove from Liked Songs" : "Add to Liked Songs"}
          </Text>
        </Pressable>
        <Pressable style={styles.bottomButton} onPress={onArtistPress}>
          <IconSymbol size={28} name={"person"} color={colors.primary} />
          <Text style={styles.text}>Go to Artist</Text>
        </Pressable>
      </View>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    trackInfo: {
      borderBottomWidth: 1,
      borderColor: colors.primary,
    },
    spacing: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      padding: 16,
    },
    albumArt: {
      width: 60,
      height: 60,
      borderRadius: 16,
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
    bottomContainer: {
      padding: 16,
      gap: 24,
    },
    bottomButton: {
      flexDirection: "row",
      gap: 16,
      alignItems: "center",
    },
    text: {
      color: colors.primary,
      fontSize: 16,
    },
  });

export default AlbumTrackContent;
