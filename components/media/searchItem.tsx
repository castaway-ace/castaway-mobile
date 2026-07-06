import { albumApi } from "@/api/albums/api";
import {
    useUpdateAlbumInteraction,
    useUpdateArtistInteraction,
} from "@/api/interactions/mutations";
import { IconSymbol } from "@/components/ui/iconSymbol";
import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { useTheme } from "@/contexts/themeContext";
import { SearchItemElement, SearchItemType } from "@/utils/search";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { FC, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { blurHash } from "@/constants/blur";

interface SearchItemProps {
  item: SearchItemElement;
}

const albumPlaceholder = require("../../assets/placeholders/album-placeholder.png");
const artistPlaceholder = require("../../assets/placeholders/artist-placeholder.png");

const SearchItem: FC<SearchItemProps> = ({ item }) => {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [isStarting, setIsStarting] = useState(false);

  const { mutate: albumInteraction } = useUpdateAlbumInteraction();
  const { mutate: artistInteraction } = useUpdateArtistInteraction();

  const { playQueue } = useAudioPlayerContext();

  const onPress = async () => {
    if (item.type === SearchItemType.ALBUM) {
      albumInteraction(item.id);
      router.navigate(`/(tabs)/search/albums/${item.id}`);
    } else if (item.type === SearchItemType.ARTIST) {
      artistInteraction(item.id);
      router.navigate(`/(tabs)/search/artists/${item.id}`);
    } else {
      const albumId = item?.albumId;
      if (!albumId || isStarting) {
        return;
      }

      setIsStarting(true);

      if (!albumId) {
        return;
      }

      try {
        const album = await queryClient.fetchQuery({
          queryKey: ["album", albumId],
          queryFn: () => albumApi.getOne(albumId),
        });

        const startIndex = album.tracks.findIndex(
          (track) => track.id === item.id,
        );

        if (startIndex === -1) {
          throw new Error(
            `Track ${item.id} not present in album ${item.albumId} track list`,
          );
        }

        playQueue(album.tracks, startIndex);
      } catch (error) {
        console.error("Failed to start album queue from search", error);
      } finally {
        albumInteraction(albumId);
        setIsStarting(false);
      }
    }
  };

  const imageSource = item.imageUrl
    ? { uri: item.imageUrl }
    : item.type === SearchItemType.ARTIST
      ? artistPlaceholder
      : albumPlaceholder;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.leftContainer}>
        <Image source={imageSource} placeholder={blurHash} style={styles.art} />
        <View style={styles.textContainer}>
          <Text style={styles.text} numberOfLines={1}>
            {item.text}
          </Text>
          <Text style={styles.subText} numberOfLines={1}>
            {item.subText}
          </Text>
        </View>
      </View>
      <IconSymbol size={28} name={"ellipsis"} color={colors.primary} />
    </Pressable>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    leftContainer: {
      display: "flex",
      flexDirection: "row",
      gap: 8,
      width: "70%",
    },
    art: {
      width: 48,
      height: 48,
      borderRadius: 4,
    },
    textContainer: {
      display: "flex",
      justifyContent: "center",
      gap: 4,
    },
    text: {
      color: colors.primary,
      fontSize: 16,
    },
    subText: {
      color: colors.secondary,
      fontSize: 14,
    },
  });

export default SearchItem;
