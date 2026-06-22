import { useDeletePlaylist } from "@/api/mutations/playlists";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useSheetModal } from "@/contexts/sheet-modal-context";
import { router, usePathname } from "expo-router";
import { FC, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ThemeColors } from "../../../constants/theme";
import { useTheme } from "../../../contexts/theme-context";

const PlaylistContent: FC = () => {
  const { active, close } = useSheetModal();
  const pathname = usePathname();

  const { mutate: deletePlaylist } = useDeletePlaylist();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const inLibrary = pathname.startsWith("/library");

  if (active?.type !== "playlist") return null;

  const location = inLibrary ? "library" : "home";

  const onPlaylistDeletePress = () => {
    deletePlaylist(active.id, {
      onSuccess: () => {
        close();
        router.replace(`/${location}`);
      },
    });
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.bottomButton} onPress={onPlaylistDeletePress}>
        <IconSymbol size={28} name={"minus.circle"} color={colors.primary} />
        <Text style={styles.text}>Delete Playlist</Text>
      </Pressable>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
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

export default PlaylistContent;
