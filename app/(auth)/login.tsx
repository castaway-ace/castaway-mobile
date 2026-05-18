import { useLogin } from "@/mutations/login";
import * as Device from "expo-device";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as z from "zod";

const LoginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(12, { message: "Password must be at least 12 characters" }),
});

const Login = () => {
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
      <Text style={styles.logo}>Castaway</Text>
      <View style={styles.inputContainer}>
        <Text>Email</Text>
        <TextInput
          style={styles.inputField}
          autoCapitalize="none"
          autoCorrect={false}
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
        <Text>Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  logo: { fontSize: 40, textAlign: "center" },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    backgroundColor: "darkgray",
    paddingTop: 100,
    gap: 36,
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  inputField: {
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 8,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  toggleButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  toggleText: {
    color: "blue",
    fontSize: 14,
  },
  button: {
    backgroundColor: "blue",
    padding: 16,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: "gray",
    opacity: 0.6,
  },
  buttonText: { color: "white", textAlign: "center", fontSize: 16 },
  errorText: {
    color: "red",
  },
});

export default Login;
