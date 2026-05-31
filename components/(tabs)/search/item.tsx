import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { SearchItemElements } from "@/utils/search";
import { Image } from "expo-image";
import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface SearchItemProps {
  item: SearchItemElements;
}

const SearchItem: FC<SearchItemProps> = ({ item }) => {
  const { colors } = useTheme();
  const { accessToken } = useAuth();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { imageUrl, text, subText } = item;

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <Image
          source={{
            uri: imageUrl,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }}
          style={styles.art}
        />
        <View style={styles.textContainer}>
          <Text style={styles.text} numberOfLines={1}>
            {text}
          </Text>
          <Text style={styles.subText} numberOfLines={1}>
            {subText}
          </Text>
        </View>
      </View>
      <IconSymbol size={28} name={"ellipsis"} color={colors.primary} />
    </View>
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
