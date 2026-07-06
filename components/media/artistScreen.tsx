import { useArtist, useArtistImage } from "@/api/artists/queries";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { FC, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useArtistStar } from "@/api/artists/mutations";
import { blurHash } from "@/constants/blur";
import { IconSymbol } from "@/components/ui/iconSymbol";
import AlbumItem from "./albumItem";

interface ArtistScreenProps {
  id: string;
  onAlbumPress: (albumId: string) => void;
}

const ArtistScreen: FC<ArtistScreenProps> = ({ id, onAlbumPress }) => {
  const { data: artist } = useArtist(id);
  const { data: artistImageUrl } = useArtistImage(id);
  const { mutate } = useArtistStar();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const tabBarHeight = useBottomTabBarHeight();

  const onLikeButtonPress = () => {
    if (!artist) return;
    mutate({ id: artist.id, starred: !!artist?.starred });
  };

  const imageSource = artistImageUrl
    ? {
        uri: artistImageUrl,
      }
    : require("../../assets/placeholders/artist-placeholder.png");

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
            source={imageSource}
            placeholder={blurHash}
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
          {artist?.albums?.map((album) => {
            return (
              <Pressable
                key={album.id}
                style={styles.albumItem}
                onPress={() => onAlbumPress(album.id)}
              >
                <AlbumItem id={album.id} />
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
