import { useArtistCover } from "@/api/queries/artists";
import { Artist } from "@/types/artists";
import { Image } from "expo-image";
import { FC } from "react";
import { StyleSheet, Text, View } from "react-native";

interface ArtistItemProps {
  artist: Artist;
}

const ArtistItem: FC<ArtistItemProps> = ({ artist }) => {
  const { data: artistCover } = useArtistCover(artist.id);
  return (
    <View key={artist.id} style={styles.artistItem}>
      <Image source={artistCover} style={styles.artistArt} />
      <Text style={styles.artistName}>{artist.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  artistItem: {
    display: "flex",
    backgroundColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 8,
    width: 240,
    height: 72,
    borderRadius: 12,
  },
  artistArt: {
    width: 60,
    height: 60,
    borderRadius: 32,
  },
  artistName: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ArtistItem;
