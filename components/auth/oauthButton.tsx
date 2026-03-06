import Ionicons from "@expo/vector-icons/Ionicons";
import { Animated, Pressable, StyleSheet, Text } from "react-native";

const COLORS = {
  bg: "#0a0a0f",
  surface: "#12121a",
  surfacePressed: "#1a1a25",
  border: "#1f1f2e",
  textPrimary: "#e8e6f0",
  textSecondary: "#7a7890",
  textMuted: "#4a4860",
  accent: "#c4a1ff",
  google: "#ea4335",
  facebook: "#1877f2",
};

const OAuthButton = ({
  provider,
  onPress,
  fadeAnim,
}: {
  provider: "google" | "facebook";
  onPress: () => void;
  fadeAnim: Animated.Value;
}) => {
  const isGoogle = provider === "google";

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 0],
            }),
          },
        ],
      }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.oauthButton,
          pressed && styles.oauthButtonPressed,
        ]}
      >
        <Ionicons
          name={isGoogle ? "logo-google" : "logo-facebook"}
          size={20}
          color={isGoogle ? COLORS.google : COLORS.facebook}
        />
        <Text style={styles.oauthButtonText}>
          Continue with {isGoogle ? "Google" : "Facebook"}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export default OAuthButton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 36,
  },

  // OAuth buttons
  buttonsContainer: {
    width: "100%",
    maxWidth: 320,
    gap: 12,
  },
  oauthButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  oauthButtonPressed: {
    backgroundColor: COLORS.surfacePressed,
    borderColor: "#333",
  },
  oauthButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.5,
  },
});
