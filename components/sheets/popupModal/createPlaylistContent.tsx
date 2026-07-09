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
    const name = playlistName.trim();
    if (!name) return;

    createPlaylist(name, {
      onSuccess: (newPlaylist) => {
        close();
        playlistInteraction(newPlaylist.id);
        closePlayer();

        const goToPlaylist = () =>
          router.push(`/(tabs)/${location}/playlists/${newPlaylist.id}`);

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
