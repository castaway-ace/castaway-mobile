import { useLogin } from "@/api/auth/mutations";
import AuthField from "@/components/auth/authField";
import { ThemeColors } from "@/constants/theme";
import { LoginSchema } from "@/constants/validation";
import { useTheme } from "@/contexts/themeContext";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Login = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [zodErrors, setZodErrors] = useState<
    Record<string, string | undefined>
  >({});

  const passwordRef = useRef<TextInput>(null);

  const {
    mutateAsync: login,
    isPending: isLoginPending,
    error: loginError,
  } = useLogin();

  const validation = useMemo(
    () => LoginSchema.safeParse({ email, password }),
    [email, password],
  );

  const clearError = (field: string) =>
    setZodErrors((prev) => ({ ...prev, [field]: undefined }));

  const onLoginPress = async () => {
    if (!validation.success) {
      const errorMap: Record<string, string> = {};
      validation.error.issues.forEach((i) => {
        errorMap[i.path.join(".")] = i.message;
      });
      setZodErrors(errorMap);
      return;
    }
    await login(validation.data);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require("../../assets/images/castaway.png")}
            />
            <Text style={styles.logoText}>Castaway</Text>
          </View>

          <AuthField
            label="Email"
            placeholder="Email Address"
            value={email}
            onChangeText={(text) => {
              clearError("email");
              setEmail(text);
            }}
            error={zodErrors.email}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <AuthField
            ref={passwordRef}
            label="Password"
            placeholder="Password"
            secure
            value={password}
            onChangeText={(text) => {
              clearError("password");
              setPassword(text);
            }}
            error={zodErrors.password}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
            autoComplete="password"
            returnKeyType="go"
            onSubmitEditing={onLoginPress}
          />

          <Pressable
            style={[styles.button, isLoginPending && styles.buttonDisabled]}
            disabled={isLoginPending}
            onPress={onLoginPress}
          >
            <Text style={styles.buttonText}>Log In</Text>
          </Pressable>

          {loginError?.message ? (
            <Text style={styles.formError}>{loginError.message}</Text>
          ) : null}

          <View style={styles.signupSection}>
            <Text style={styles.signupText}>Don&apos;t have an account?</Text>
            <Link style={styles.signupLink} href={"/(auth)/signup"}>
              Sign up
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: { flex: 1 },
    content: {
      flexGrow: 1,
      justifyContent: "center",
      gap: 24,
      paddingHorizontal: 32,
      paddingVertical: 32,
    },
    logoContainer: {
      alignItems: "center",
      gap: 8,
    },
    logo: { width: 72, height: 72, borderRadius: 12 },
    logoText: { color: colors.primary, fontSize: 48, textAlign: "center" },
    button: {
      backgroundColor: colors.accent,
      padding: 16,
      borderRadius: 8,
    },
    buttonDisabled: {
      backgroundColor: "gray",
      opacity: 0.6,
    },
    buttonText: { color: "white", textAlign: "center", fontSize: 18 },
    formError: {
      color: colors.error,
      textAlign: "center",
      fontSize: 14,
    },
    signupSection: {
      alignItems: "center",
      gap: 8,
    },
    signupText: {
      fontSize: 18,
      color: colors.primary,
    },
    signupLink: {
      fontSize: 18,
      color: colors.accent,
    },
  });

export default Login;
