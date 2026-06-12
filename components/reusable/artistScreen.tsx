import { albumCoverQueryOptions } from "@/api/queries/albums";
import { useArtist, useArtistImage } from "@/api/queries/artists";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useQueries } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { FC, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useArtistStar } from "../../api/mutations/artists";
import { IconSymbol } from "../ui/icon-symbol";

interface ArtistScreenProps {
  id: string;
  onAlbumPress: (albumId: string) => void;
}

const ArtistScreen: FC<ArtistScreenProps> = ({ id, onAlbumPress }) => {
  const { data: artist } = useArtist(id);
  const { mutate } = useArtistStar();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: artistImageUrl } = useArtistImage(id);

  const tabBarHeight = useBottomTabBarHeight();

  const albums = artist?.albums ?? [];

  const albumCovers = useQueries({
    queries: albums?.map((album) => albumCoverQueryOptions(album.id)),
  });

  const onLikeButtonPress = () => {
    if (!artist) return;
    mutate({ id: artist.id, starred: !!artist?.starred });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: tabBarHeight + 84,
        }}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol size={32} name={"chevron.left"} color={colors.primary} />
        </Pressable>
        <View style={styles.artistImageContainer}>
          <Image
            source={{
              uri: artistImageUrl,
            }}
            placeholder={require("../../assets/placeholders/artist-placeholder.png")}
            style={styles.artistImage}
          />
        </View>
        <View style={styles.artistInfoContainer}>
          <Text style={styles.artistTitle}>{artist?.name}</Text>
          <Pressable onPress={onLikeButtonPress}>
            <IconSymbol
              name={artist?.starred ? "heart.fill" : "heart"}
              size={24}
              color={colors.primary}
            />
          </Pressable>
        </View>
        <View style={styles.albumContainer}>
          <Text style={styles.albumHeader}>Albums</Text>
          {artist?.albums?.map((album, index) => {
            const coverUrl = albumCovers[index]?.data;
            return (
              <Pressable
                key={album.id}
                style={styles.albumItem}
                onPress={() => onAlbumPress(album.id)}
              >
                <Image source={{ uri: coverUrl }} style={styles.albumArt} />
                <Text style={styles.albumTitle}>{album.title}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.bottomSpacing}></View>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 16,
    },
    backButton: {
      position: "absolute",
      left: 4,
    },
    artistImageContainer: {
      display: "flex",
      alignItems: "center",
      marginBottom: 24,
    },
    artistImage: {
      width: "60%",
      aspectRatio: 800 / 800,
      borderRadius: 8,
    },
    artistInfoContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 24,
    },
    artistTitle: {
      color: colors.primary,
      fontSize: 22,
      fontWeight: 500,
    },
    albumContainer: {
      display: "flex",
      gap: 16,
    },
    albumHeader: {
      color: colors.primary,
      fontSize: 24,
    },
    albumArt: {
      width: 120,
      height: 120,
      borderRadius: 8,
    },
    albumItem: {
      display: "flex",
      gap: 8,
    },
    albumTitle: {
      color: colors.primary,
      fontSize: 16,
    },
    bottomSpacing: {
      height: 140,
    },
  });

export default ArtistScreen;
