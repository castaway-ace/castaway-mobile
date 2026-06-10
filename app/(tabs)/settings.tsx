import { ThemeColors } from "@/constants/theme";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Settings = () => {
  const { logOut } = useAuth();
  const { clearQueue } = useAudioPlayerContext();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const onLogoutPress = () => {
    clearQueue();
    logOut();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.buttonContainer}>
        <Pressable onPress={onLogoutPress} style={styles.button}>
          <Text style={styles.buttonText}>Log Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.primary,
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
    },
    button: {
      display: "flex",
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    buttonText: {
      color: colors.background,
      fontSize: 16,
    },
  });

export default Settings;
