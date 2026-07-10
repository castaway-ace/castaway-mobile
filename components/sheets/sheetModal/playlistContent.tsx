import { useDeletePlaylist } from "@/api/playlists/mutations";
import { IconSymbol } from "@/components/ui/iconSymbol";
import { usePopupModal } from "@/contexts/popupModalContext";
import { SheetPlaylist, useSheetModal } from "@/contexts/sheetModalContext";
import { router, usePathname } from "expo-router";
import { FC, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";

interface PlaylistContentProps {
  content: SheetPlaylist;
}

const PlaylistContent: FC<PlaylistContentProps> = ({ content }) => {
  const { close } = useSheetModal();
  const { openConfirm } = usePopupModal();
  const pathname = usePathname();

  const { mutate: deletePlaylist } = useDeletePlaylist();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const inLibrary = pathname.startsWith("/library");

  const location = inLibrary ? "library" : "home";

  const onPlaylistDeletePress = () => {
    openConfirm({
      title: "Delete Playlist",
      message:
        "Are you sure you want to delete this playlist? This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: () => {
        deletePlaylist(content.id, {
          onSuccess: () => {
            close();
            router.replace(`/${location}`);
          },
        });
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
