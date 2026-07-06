import { useRemoveTrackFromPlaylist } from "@/api/mutations/playlists";
import { useTrackStar } from "@/api/mutations/tracks";
import { usePlaylist } from "@/api/queries/playlist";
import {
  SheetPlaylistTrack,
  SheetType,
  useSheetModal,
} from "@/contexts/sheet-modal-context";
import { PlaylistType } from "@/types/playlist";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import { FC, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  useUpdateAlbumInteraction,
  useUpdateArtistInteraction,
} from "../../../api/mutations/interactions";
import { useAlbumCover } from "../../../api/queries/albums";
import { useTrack } from "../../../api/queries/tracks";
import { blurHash } from "../../../constants/blur";
import { ThemeColors } from "../../../constants/theme";
import { useTheme } from "../../../contexts/theme-context";
import { IconSymbol } from "../../ui/icon-symbol";

const PlaylistTrackContent: FC = () => {
  const { active, open, close } = useSheetModal();
  const playlistContent = active as SheetPlaylistTrack | null;
  const { data: track } = useTrack(playlistContent?.trackId);
  const { data: playlist } = usePlaylist(playlistContent?.id);
  const pathname = usePathname();

  const { data: albumArtUrl } = useAlbumCover(track?.album.id);

  const { mutate: albumInteraction } = useUpdateAlbumInteraction();
  const { mutate: artistInteraction } = useUpdateArtistInteraction();
  const { mutate: trackStar } = useTrackStar();
  const { mutate: removePlaylistTrack } = useRemoveTrackFromPlaylist();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const inHome = pathname.startsWith("/home");
  const inLibrary = pathname.startsWith("/library");

  const location = inHome ? "home" : inLibrary ? "library" : "search";

  if (!track) return null;

  const starred = track.starred;

  const onPlaylistPress = () => {
    open({ type: SheetType.PLAYLIST_SELECT, trackId: track.id });
  };

  const onRemoveFromPlaylistPress = () => {
    if (!playlist?.id) return;
    removePlaylistTrack({ playlistId: playlist.id, trackId: track.id });
    close();
  };

  const onLikedSongPress = () => {
    trackStar({ id: track.id, starred: !!starred });
    close();
  };

  const onAlbumPress = () => {
    if (!track?.album) return;
    const albumId = track.album.id;
    close();
    albumInteraction(albumId);
    router.navigate(`/(tabs)/${location}/albums/${albumId}`);
  };

  const onArtistPress = () => {
    if (!track?.artists) return;
    const artistId = track.artists[0].id;
    close();
    artistInteraction(artistId);
    router.navigate(`/(tabs)/${location}/artists/${artistId}`);
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
            <Text style={styles.trackTitle}>{track?.title}</Text>
            <Text style={styles.trackArtists}>
              {track?.artists?.map((artist) => artist.name)?.join(", ")} •{" "}
              {track?.album.title}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <Pressable style={styles.bottomButton} onPress={onPlaylistPress}>
          <IconSymbol size={28} name={"plus.circle"} color={colors.primary} />
          <Text style={styles.text}>Add to Playlist</Text>
        </Pressable>
        {playlist?.type === PlaylistType.USER && (
          <Pressable
            style={styles.bottomButton}
            onPress={onRemoveFromPlaylistPress}
          >
            <IconSymbol
              size={28}
              name={"minus.circle"}
              color={colors.primary}
            />
            <Text style={styles.text}>Remove from this playlist</Text>
          </Pressable>
        )}
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
        <Pressable style={styles.bottomButton} onPress={onAlbumPress}>
          <IconSymbol
            size={28}
            name={"opticaldisc.fill"}
            color={colors.primary}
          />
          <Text style={styles.text}>Go to Album</Text>
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

export default PlaylistTrackContent;
