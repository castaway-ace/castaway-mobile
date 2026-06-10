import { useAlbum, useAlbumCover } from "@/api/queries/albums";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface AlbumScreenProps {
  id: string;
}

const AlbumScreen: FC<AlbumScreenProps> = ({ id }) => {
  const { data: album } = useAlbum(id);

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: albumCoverUrl } = useAlbumCover(id);

  return (
    <View>
      <Image
        source={{
          uri: albumCoverUrl,
        }}
        style={styles.albumArt}
      />
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    albumArt: {
      width: 160,
      height: 160,
      borderRadius: 8,
    },
  });

export default AlbumScreen;
