import { useUpdatePlaylistInteraction } from "@/api/interactions/mutations";
import { useCreatePlaylist } from "@/api/mutations/playlists";
import { ThemeColors } from "@/constants/theme";
import { usePopupModal } from "@/contexts/popup-modal.context";
import { useTheme } from "@/contexts/theme-context";
import { router } from "expo-router";
import { FC, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

const PopupModal: FC = () => {
  const { colors } = useTheme();
  const { isOpen, close } = usePopupModal();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { mutate: createPlaylist } = useCreatePlaylist();
  const { mutate: playlistInteraction } = useUpdatePlaylistInteraction();

  const [playlistName, setPlaylistName] = useState<string>("");

  const dismiss = () => {
    setPlaylistName("");
    close();
  };

  const tapBackdrop = Gesture.Tap().onEnd(() => {
    runOnJS(dismiss)();
  });

  const onSubmitPress = () => {
    const name = playlistName.trim();
    if (!name) return;

    createPlaylist(name, {
      onSuccess: (newPlaylist) => {
        dismiss();
        router.push(`/library/playlists/${newPlaylist.id}`);
        playlistInteraction(newPlaylist.id);
      },
    });
  };

  if (!isOpen) return null;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={tapBackdrop}>
        <Animated.View style={styles.backdrop} />
      </GestureDetector>
      <View style={styles.sheet}>
        <Text style={styles.text}>Create new Playlist</Text>
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
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFill,
      justifyContent: "center",
      alignItems: "center",
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    sheet: {
      width: "80%",
      gap: 24,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: colors.background,
      padding: 24,
    },
    text: {
      fontSize: 20,
      color: colors.primary,
    },
    textFieldContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: colors.secondary,
    },
    textField: {
      flex: 1,
      paddingVertical: 8,
      color: colors.primary,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "center",
    },
    submitButton: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.secondary,
    },
    buttonText: {
      fontSize: 16,
      color: colors.primary,
    },
  });

export default PopupModal;
