import { Fonts } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { FC } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TabHeader: FC = () => {
  return (
    <SafeAreaView style={styles.layout} edges={["top", "left", "right"]}>
      <View style={styles.brandContainer}>
        <Text style={styles.brandTitle}>Castaway</Text>
      </View>
      <Pressable onPress={(() => router.navigate("/profile"))} style={styles.profile}>
        <Ionicons name="person" size={20} color="white" />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  layout: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "white",
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: 16,
  },
  brandContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  brandTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 24,
    fontWeight: "bold",
  },
  profile: {
    padding: 8,
  }
});

export default TabHeader;