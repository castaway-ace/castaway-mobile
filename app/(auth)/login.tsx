import { useLogin } from "@/api/auth/mutations";
import AuthField from "@/components/auth/authField";
import { makeAuthFormStyles } from "@/components/auth/authFormStyles";
import AuthHeader from "@/components/auth/authHeader";
import AuthScreen from "@/components/auth/authScreen";
import { useAuthForm } from "@/components/auth/useAuthForm";
import { LoginSchema } from "@/constants/validation";
import { useTheme } from "@/contexts/themeContext";
import { Link } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const Login = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeAuthFormStyles(colors), [colors]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { errors, clearError, validate } = useAuthForm(LoginSchema);

  const passwordRef = useRef<TextInput>(null);

  const {
    mutateAsync: login,
    isPending: isLoginPending,
    error: loginError,
  } = useLogin();

  const onLoginPress = async () => {
    const data = validate({ email, password });
    if (!data) return;
    await login(data);
  };

  return (
    <AuthScreen>
      <AuthHeader />

      <AuthField
        label="Email"
        placeholder="Email Address"
        value={email}
        onChangeText={(text) => {
          clearError("email");
          setEmail(text);
        }}
        error={errors.email}
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
        error={errors.password}
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
    </AuthScreen>
  );
};

export default Login;
