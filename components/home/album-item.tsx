import { useAlbumCover } from "@/api/queries/albums";
import { Album } from "@/types/albums";
import { Image } from "expo-image";
import { FC } from "react";
import { StyleSheet, Text, View } from "react-native";

interface AlbumProps {
  album: Album;
}

const AlbumItem: FC<AlbumProps> = ({ album }) => {
  const { data: albumUrl } = useAlbumCover(album.id);

  return (
    <View style={styles.albumContainer}>
      <Image source={albumUrl} style={styles.albumArt} />
      <Text style={styles.albumName}>{album.title}</Text>
      <Text style={styles.albumArtist}>
        {album.artists.map((artist) => artist).join(", ")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  albumContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  albumArt: {
    width: 160,
    height: 160,
    borderRadius: 8,
  },
  albumName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  albumArtist: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default AlbumItem;
