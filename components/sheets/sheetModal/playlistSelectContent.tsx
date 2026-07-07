import { useAddTrackToPlaylist } from "@/api/playlists/mutations";
import { usePlaylists } from "@/api/playlists/queries";
import { IconSymbol } from "@/components/ui/iconSymbol";
import PlaylistCover from "@/components/media/playlistCover";
import { usePopupModal } from "@/contexts/popupModalContext";
import { useSheetModal } from "@/contexts/sheetModalContext";
import { FC, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";

interface PlaylistSelectContentProps {
  trackId: string;
}

const PlaylistSelectContent: FC<PlaylistSelectContentProps> = ({ trackId }) => {
  const { close } = useSheetModal();
  const { open: openCreatePlaylist } = usePopupModal();
  const { data: playlistData } = usePlaylists({ onlyUser: true });

  const playlists = playlistData?.pages.flatMap((page) => page) ?? [];

  const { mutate: addPlaylistTrack } = useAddTrackToPlaylist();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const onPlaylistPress = (id: string, name: string) => {
    addPlaylistTrack({ playlistId: id, trackId, playlistName: name });
    close();
  };

  const onCreatePlaylistPress = () => {
    close();
    openCreatePlaylist({ trackId });
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.spacing} onPress={onCreatePlaylistPress}>
        <View style={styles.createIcon}>
          <IconSymbol size={28} name={"plus"} color={colors.primary} />
        </View>
        <View style={styles.trackLeftInfo}>
          <Text style={styles.trackTitle}>Create new playlist</Text>
        </View>
      </Pressable>
      {playlists.map((playlist) => (
        <Pressable
          key={playlist.id}
          style={styles.spacing}
          onPress={() => onPlaylistPress(playlist.id, playlist.name)}
        >
          <PlaylistCover
            urls={playlist.albumCoverUrls}
            style={styles.albumArt}
          />
          <View style={styles.trackLeftInfo}>
            <Text style={styles.trackTitle}>{playlist.name}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
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
    createIcon: {
      width: 60,
      height: 60,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.secondary,
    },
    trackLeftInfo: {
      display: "flex",
      gap: 4,
    },
    trackTitle: {
      color: colors.primary,
      fontSize: 18,
    },
  });

export default PlaylistSelectContent;
