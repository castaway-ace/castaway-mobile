import { useLogin } from "@/mutations/login";
import * as Device from "expo-device";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as z from "zod";
import { makeStyles } from "../../components/auth/login";
import { useTheme } from "../../contexts/theme-context";

const LoginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(12, { message: "Password must be at least 12 characters" }),
});

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

  const validation = LoginSchema.safeParse({
    email,
    password,
  });

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
    await login({
      ...validation.data,
      deviceInfo: {
        name: Device.deviceName ?? "",
        model: Device.modelName ?? "",
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
    </SafeAreaView>
  );
};

export default Login;
