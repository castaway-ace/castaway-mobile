import { useUpdatePlaylistInteraction } from "@/api/interactions/mutations";
import {
  useAddTrackToPlaylist,
  useCreatePlaylist,
} from "@/api/playlists/mutations";
import { usePlayerModal } from "@/contexts/playerModalContext";
import { usePopupModal } from "@/contexts/popupModalContext";
import { useTheme } from "@/contexts/themeContext";
import { useTabLocation } from "@/utils/useTabLocation";
import { router } from "expo-router";
import { FC, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { makePopupStyles } from "./popupStyles";

interface CreatePlaylistContentProps {
  trackId?: string;
}

/**
 * New-playlist dialog: a name field and submit, optionally seeding the playlist
 * with a track.
 *
 * @remarks
 * When opened from a track's "add to playlist" flow, `trackId` is set and the
 * newly created playlist is seeded with that track before navigation; otherwise
 * it's created empty. Either way the user is taken straight to the new playlist,
 * so the create doubles as "create and open".
 *
 * @param trackId - Optional track to add to the playlist on creation.
 */
const CreatePlaylistContent: FC<CreatePlaylistContentProps> = ({ trackId }) => {
  const { colors } = useTheme();
  const { close } = usePopupModal();
  const { close: closePlayer } = usePlayerModal();
  const location = useTabLocation();
  const styles = useMemo(() => makePopupStyles(colors), [colors]);

  const { mutate: createPlaylist } = useCreatePlaylist();
  const { mutate: addPlaylistTrack } = useAddTrackToPlaylist();
  const { mutate: playlistInteraction } = useUpdatePlaylistInteraction();

  const [playlistName, setPlaylistName] = useState<string>("");

  const onSubmitPress = () => {
    // Ignore whitespace-only names rather than creating an untitled playlist.
    const name = playlistName.trim();
    if (!name) return;

    createPlaylist(name, {
      onSuccess: (newPlaylist) => {
        // Tear down the overlays (popup, and the player if it launched this) so
        // the destination playlist isn't left underneath them, and record the
        // interaction so it surfaces in recency rows.
        close();
        playlistInteraction(newPlaylist.id);
        closePlayer();

        const goToPlaylist = () =>
          router.push(`/(tabs)/${location}/playlists/${newPlaylist.id}`);

        // Seed the track first when present, and only navigate once it's added
        // so the playlist screen opens already showing it; otherwise go straight.
        if (trackId) {
          addPlaylistTrack(
            { playlistId: newPlaylist.id, trackId, playlistName: name },
            { onSuccess: goToPlaylist },
          );
        } else {
          goToPlaylist();
        }
      },
    });
  };

  return (
    <View style={styles.sheet}>
      <Text style={styles.title}>Create new Playlist</Text>
      <View style={styles.textFieldContainer}>
        <TextInput
          style={styles.textField}
          placeholder="Enter Name"
          placeholderTextColor={colors.primary}
          value={playlistName}
          onChangeText={setPlaylistName}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.submitButton} onPress={onSubmitPress}>
          <Text style={styles.buttonText}>Submit</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default CreatePlaylistContent;
