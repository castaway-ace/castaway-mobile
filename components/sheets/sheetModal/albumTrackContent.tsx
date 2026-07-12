import { Image } from "expo-image";
import { router } from "expo-router";
import { FC, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useAlbumCover } from "@/api/albums/queries";
import { useUpdateArtistInteraction } from "@/api/interactions/mutations";
import { useTrackStar } from "@/api/tracks/mutations";
import { useTrack } from "@/api/tracks/queries";
import { blurHash } from "@/constants/blur";
import {
    SheetAlbumTrack,
    SheetType,
    useSheetModal,
} from "@/contexts/sheetModalContext";
import { useTheme } from "@/contexts/themeContext";
import { IconSymbol } from "@/components/ui/iconSymbol";
import { useTabLocation } from "@/utils/useTabLocation";
import { makeTrackSheetStyles } from "./sheetStyles";

interface AlbumTrackContentProps {
  content: SheetAlbumTrack;
}

/**
 * Options sheet for a track opened from an album: add to a playlist, like/unlike,
 * or jump to the artist.
 *
 * @remarks
 * The album-context sibling of {@link PlaylistTrackContent}. It omits the
 * "remove from playlist" action (there's no playlist here) and the "go to album"
 * jump (already on the album). Same pattern otherwise: record the artist
 * interaction and close before navigating.
 */
const AlbumTrackContent: FC<AlbumTrackContentProps> = ({ content }) => {
  const { open, close } = useSheetModal();
  const { data: track } = useTrack(content.trackId);
  const location = useTabLocation();

  const { data: albumArtUrl } = useAlbumCover(track?.album.id);

  const { mutate: artistInteraction } = useUpdateArtistInteraction();
  const { mutate: trackStar } = useTrackStar();

  const { colors } = useTheme();
  const styles = useMemo(() => makeTrackSheetStyles(colors), [colors]);

  if (!track) return null;

  const starred = !!track.starred;

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

export default AlbumTrackContent;
