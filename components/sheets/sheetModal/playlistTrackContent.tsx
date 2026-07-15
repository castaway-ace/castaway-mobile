import { useRemoveTrackFromPlaylist } from "@/api/playlists/mutations";
import { usePlaylist } from "@/api/playlists/queries";
import { useTrackStar } from "@/api/tracks/mutations";
import { usePopupModal } from "@/contexts/popupModalContext";
import {
    SheetPlaylistTrack,
    SheetType,
    useSheetModal,
} from "@/contexts/sheetModalContext";
import { PlaylistType } from "@/types/playlist";
import { presignedImageSource } from "@/utils/images";
import { Image } from "expo-image";
import { router } from "expo-router";
import { FC, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useAlbumCover } from "@/api/albums/queries";
import {
    useUpdateAlbumInteraction,
    useUpdateArtistInteraction,
} from "@/api/interactions/mutations";
import { useTrack } from "@/api/tracks/queries";
import { blurHash } from "@/constants/blur";
import { useTheme } from "@/contexts/themeContext";
import { IconSymbol } from "@/components/ui/iconSymbol";
import { useTabLocation } from "@/utils/useTabLocation";
import { makeTrackSheetStyles } from "./sheetStyles";

interface PlaylistTrackContentProps {
  content: SheetPlaylistTrack;
}

/**
 * Options sheet for a track opened from within a playlist: add to another
 * playlist, remove from this one, like/unlike, or jump to its album or artist.
 *
 * @remarks
 * "Remove from this playlist" is shown only for {@link PlaylistType.USER}
 * playlists — system playlists (e.g. Liked Songs) aren't hand-editable. Each
 * navigation records an interaction with the destination first so recency-based
 * rows reflect the visit, and closes the sheet before routing so it doesn't
 * linger over the new screen.
 */
const PlaylistTrackContent: FC<PlaylistTrackContentProps> = ({ content }) => {
  const { open, close } = useSheetModal();
  const { openConfirm } = usePopupModal();
  const { data: track } = useTrack(content.trackId);
  const { data: playlist } = usePlaylist(content.id);
  const location = useTabLocation();

  const { data: albumArtUrl } = useAlbumCover(track?.album.id);

  const { mutate: albumInteraction } = useUpdateAlbumInteraction();
  const { mutate: artistInteraction } = useUpdateArtistInteraction();
  const { mutate: trackStar } = useTrackStar();
  const { mutate: removePlaylistTrack } = useRemoveTrackFromPlaylist();

  const { colors } = useTheme();
  const styles = useMemo(() => makeTrackSheetStyles(colors), [colors]);

  if (!track) return null;

  const starred = track.starred;

  const onPlaylistPress = () => {
    open({ type: SheetType.PLAYLIST_SELECT, trackId: track.id });
  };

  const onRemoveFromPlaylistPress = () => {
    if (!playlist?.id) return;
    openConfirm({
      title: "Remove Track",
      message: "Are you sure you want to remove this track from the playlist?",
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
      onConfirm: () => {
        removePlaylistTrack({ playlistId: playlist.id, trackId: track.id });
        close();
      },
    });
  };

  const onLikedSongPress = () => {
    trackStar({ id: track.id, starred: !!starred });
    close();
  };

  const onAlbumPress = () => {
    if (!track?.album) return;
    const albumId = track.album.id;
    // Close first, record the visit, then route within the current tab.
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
            source={albumArtUrl ? presignedImageSource(albumArtUrl) : undefined}
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

export default PlaylistTrackContent;
