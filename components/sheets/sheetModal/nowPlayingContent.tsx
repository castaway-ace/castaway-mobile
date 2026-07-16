import {
  useUpdateAlbumInteraction,
  useUpdateArtistInteraction,
} from "@/api/interactions/mutations";
import { IconSymbol } from "@/components/ui/iconSymbol";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { usePlayerModal } from "@/contexts/playerModalContext";
import { SheetType, useSheetModal } from "@/contexts/sheetModalContext";
import { useTheme } from "@/contexts/themeContext";
import { isVariousArtists } from "@/utils/artists";
import { useTabLocation } from "@/utils/useTabLocation";
import { router } from "expo-router";
import { FC, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { makeTrackSheetStyles } from "./sheetStyles";

/**
 * Options sheet for the currently-playing track, opened from the full-screen
 * player's overflow menu: add to a playlist, or jump to its album or artist.
 *
 * @remarks
 * Because it's launched from over the player modal, navigating has to dismiss
 * *two* layers — this sheet and the player itself (`closePlayer`) — so the
 * destination isn't left buried underneath them. Reads the active track from the
 * audio context and resolves its id across the queue's differing shapes.
 */
const NowPlayingContent: FC = () => {
  const { open, close } = useSheetModal();
  const { close: closePlayer } = usePlayerModal();
  const { currentTrack } = useAudioPlayerContext();
  const location = useTabLocation();

  const { mutate: albumInteraction } = useUpdateAlbumInteraction();
  const { mutate: artistInteraction } = useUpdateArtistInteraction();

  const { colors } = useTheme();
  const styles = useMemo(() => makeTrackSheetStyles(colors), [colors]);

  if (!currentTrack) return null;

  // Playlist entries expose `trackId`; other queue shapes use `id`.
  const trackId =
    "trackId" in currentTrack ? currentTrack.trackId : currentTrack.id;

  const onPlaylistPress = () => {
    if (!trackId) return;
    open({ type: SheetType.PLAYLIST_SELECT, trackId });
  };

  const onAlbumPress = () => {
    const albumId = currentTrack.album?.id;
    if (!albumId) return;
    close();
    closePlayer();
    albumInteraction(albumId);
    router.navigate(`/(tabs)/${location}/albums/${albumId}`);
  };

  const primaryArtist = currentTrack.artists?.[0];
  const canGoToArtist = !!primaryArtist?.id && !isVariousArtists(primaryArtist);

  const onArtistPress = () => {
    const artistId = currentTrack.artists?.[0]?.id;
    if (!artistId) return;
    close();
    closePlayer();
    artistInteraction(artistId);
    router.navigate(`/(tabs)/${location}/artists/${artistId}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.bottomContainer}>
        <Pressable style={styles.bottomButton} onPress={onPlaylistPress}>
          <IconSymbol size={28} name={"plus.circle"} color={colors.primary} />
          <Text style={styles.text}>Add to Playlist</Text>
        </Pressable>
        <Pressable style={styles.bottomButton} onPress={onAlbumPress}>
          <IconSymbol
            size={28}
            name={"opticaldisc.fill"}
            color={colors.primary}
          />
          <Text style={styles.text}>Go to Album</Text>
        </Pressable>
        {canGoToArtist && (
          <Pressable style={styles.bottomButton} onPress={onArtistPress}>
            <IconSymbol size={28} name={"person"} color={colors.primary} />
            <Text style={styles.text}>Go to Artist</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default NowPlayingContent;
