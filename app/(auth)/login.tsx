import { Image } from "expo-image";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLogin } from "@/api/auth/mutations";
import { LoginSchema } from "@/constants/validation";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";

const Login = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [zodErrors, setZodErrors] = useState<
    Record<string, string | undefined>
  >({});

  const {
    mutateAsync: login,
    isPending: isLoginPending,
    error: loginError,
  } = useLogin();

  const validation = useMemo(
    () => LoginSchema.safeParse({ email, password }),
    [email, password],
  );

  const onEmailChange = (text: string) => {
    setZodErrors({ ...zodErrors, email: undefined });
    setEmail(text);
  };

  const onPasswordChange = (text: string) => {
    setZodErrors({ ...zodErrors, password: undefined });
    setPassword(text);
  };

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
        style={{
          flex: 1,
          gap: 32,
          justifyContent: "center",
          paddingHorizontal: 32,
        }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.logoContainer}>
          <Image
            style={styles.logo}
            source={require("../../assets/images/castaway.png")}
          />
          <Text style={styles.logoText}>Castaway</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.inputField}
            autoCapitalize="none"
            autoCorrect={false}
            selectionColor={colors.accent}
            placeholderTextColor={colors.secondary}
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="Email Address"
            value={email}
            onChangeText={onEmailChange}
          />
          {zodErrors?.email ? (
            <Text style={styles.errorText}>{zodErrors.email}</Text>
          ) : null}
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={password}
              selectionColor={colors.accent}
              placeholderTextColor={colors.secondary}
              onChangeText={onPasswordChange}
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
            />
            <Pressable
              onPress={() => setIsPasswordVisible((prev) => !prev)}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>
                {isPasswordVisible ? "Hide" : "Show"}
              </Text>
            </Pressable>
          </View>
          {zodErrors?.password ? (
            <Text style={styles.errorText}>{zodErrors.password}</Text>
          ) : null}
        </View>
        <Pressable
          style={[styles.button, isLoginPending && styles.buttonDisabled]}
          disabled={isLoginPending}
          onPress={onLoginPress}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </Pressable>
        {loginError?.message ? (
          <Text style={[styles.errorText, { textAlign: "center" }]}>
            {loginError.message}
          </Text>
        ) : null}
        <View style={styles.signupSection}>
          <Text style={styles.signupText}>Don&apos;t have an account?</Text>
          <Link style={styles.signupLink} href={"/(auth)/signup"}>
            Sign up
          </Link>
        </View>
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
    logoContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    logo: { width: 72, height: 72, borderRadius: 12 },
    logoText: { color: colors.primary, fontSize: 48, textAlign: "center" },
    inputContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    inputLabel: {
      fontSize: 16,
      color: colors.primary,
    },
    inputField: {
      backgroundColor: colors.surface,
      borderColor: colors.primary,
      borderWidth: 1,
      color: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 16,
      borderRadius: 8,
    },
    passwordWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.primary,
      borderWidth: 1,
      borderRadius: 8,
      paddingRight: 8,
    },
    passwordInput: {
      flex: 1,
      color: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 16,
    },
    toggleButton: {
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    toggleText: {
      color: colors.accent,
      fontSize: 16,
    },
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
    errorText: {
      color: "red",
    },
    signupSection: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      alignItems: "center",
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
