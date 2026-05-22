import { useSignUp } from "@/mutations/signup";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { makeStyles } from "../../components/auth/login";
import { SignUpSchema } from "../../constants/auth";
import { useTheme } from "../../contexts/theme-context";

const Signup = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [email, setEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const [zodErrors, setZodErrors] = useState<
    Record<string, string | undefined>
  >({});

  const validation = useMemo(
    () => SignUpSchema.safeParse({ email, userName, password }),
    [email, userName, password],
  );

  const {
    mutateAsync: signup,
    isPending: isSignupPending,
    error: signUpError,
  } = useSignUp();

  const onEmailChange = (text: string) => {
    setZodErrors({ ...zodErrors, email: undefined });
    setEmail(text);
  };

  const onUserNameChange = (text: string) => {
    setZodErrors({ ...zodErrors, userName: undefined });
    setUserName(text);
  };

  const onPasswordChange = (text: string) => {
    setZodErrors({ ...zodErrors, password: undefined });
    setPassword(text);
  };

  const onSignupPress = async () => {
    if (!validation.success) {
      const errorMap: Record<string, string> = {};
      validation.error.issues.forEach((i) => {
        errorMap[i.path.join(".")] = i.message;
      });
      setZodErrors(errorMap);
      return;
    }
    await signup(validation.data);
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
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.inputField}
            autoCapitalize="none"
            autoCorrect={false}
            selectionColor={colors.accent}
            placeholderTextColor={colors.secondary}
            placeholder="User name"
            value={userName}
            onChangeText={onUserNameChange}
          />
          {zodErrors?.userName ? (
            <Text style={styles.errorText}>{zodErrors.userName}</Text>
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
          style={[styles.button, isSignupPending && styles.buttonDisabled]}
          disabled={isSignupPending}
          onPress={onSignupPress}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </Pressable>
        {signUpError?.message ? (
          <Text style={[styles.errorText, { textAlign: "center" }]}>
            {signUpError.message}
          </Text>
        ) : null}
        <View style={styles.signupSection}>
          <Text style={styles.signupText}>Already have an account?</Text>
          <Link style={styles.signupLink} href={"/(auth)/login"}>
            Log in
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;
