import { getAlbumArtUrl } from '@/api/client';
import { Track } from '@/api/tracks';
import { FC } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from './ui/icon-symbol';

interface TrackItemProps {
    track: Track
}

export const TrackItem: FC<TrackItemProps> = ({ track }) => {
 const artistName = track.artists[0].name
  const albumTitle = track.album.title
    return (
      <View key={track.id} style={styles.container}>
        <View style={styles.containerContent}>
          <Image
            source={{ uri: getAlbumArtUrl(track.album.id) }}
            style={styles.albumArt}
          />
          <View style={styles.info}>
            <Text style={styles.trackTitle}>{track?.title}</Text>

            <Text>{artistName} - {albumTitle}</Text>
          </View>
        </View>
        <Pressable>
          <IconSymbol size={28} name="ellipsis" color={"black"} />
        </Pressable>
      </View>
  );
};

const styles = StyleSheet.create({
    container: {
      display: "flex",
      flexDirection: "row",
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 8,
      backgroundColor: "gray",
      borderRadius: 8,
      justifyContent: "space-between",
      alignItems: "center"
    },
  
    containerContent: {
      display: "flex",
      flexDirection: 'row',
      alignItems: "center",
      gap: 8,
    },
    
    albumArt: {
      width: 60,
      height: 60,
      borderRadius: 4,
      backgroundColor: "#f0f0f0",
    },
  
    trackTitle: {
      fontWeight: 500,
    },
    info: {
      display: "flex",
      flexDirection: 'column',
    }
  });