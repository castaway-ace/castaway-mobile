import {
    useUpdateAlbumInteraction,
    useUpdateArtistInteraction,
} from "@/api/interactions/mutations";
import { IconSymbol } from "@/components/ui/iconSymbol";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { usePlayerModal } from "@/contexts/playerModalContext";
import { SheetType, useSheetModal } from "@/contexts/sheetModalContext";
import { useTheme } from "@/contexts/themeContext";
import { router } from "expo-router";
import { FC, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTabLocation } from "@/utils/useTabLocation";
import { makeTrackSheetStyles } from "./sheetStyles";

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
        <Pressable style={styles.bottomButton} onPress={onArtistPress}>
          <IconSymbol size={28} name={"person"} color={colors.primary} />
          <Text style={styles.text}>Go to Artist</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default NowPlayingContent;
