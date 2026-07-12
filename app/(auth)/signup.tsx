import { useSignUp } from "@/api/auth/mutations";
import AuthField from "@/components/auth/authField";
import { makeAuthFormStyles } from "@/components/auth/authFormStyles";
import AuthHeader from "@/components/auth/authHeader";
import AuthScreen from "@/components/auth/authScreen";
import PasswordRequirements from "@/components/auth/passwordRequirements";
import { useAuthForm } from "@/components/auth/useAuthForm";
import { SignUpSchema } from "@/constants/validation";
import { useTheme } from "@/contexts/themeContext";
import { Link } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

/**
 * Signup screen.
 *
 * @remarks
 * Mirrors {@link Login} but validates against {@link SignUpSchema} and adds a
 * username field and a live {@link PasswordRequirements} checklist (fed the
 * password value) so strength feedback is visible as the user types. Fields chain
 * focus email → username → password via refs.
 */
const Signup = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeAuthFormStyles(colors), [colors]);

  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const { errors, clearError, validate } = useAuthForm(SignUpSchema);

  const userNameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const {
    mutateAsync: signup,
    isPending: isSignupPending,
    error: signUpError,
  } = useSignUp();

  const onSignupPress = async () => {
    const data = validate({ email, userName, password });
    if (!data) return;
    await signup(data);
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
        onSubmitEditing={() => userNameRef.current?.focus()}
      />

      <AuthField
        ref={userNameRef}
        label="Username"
        placeholder="User name"
        value={userName}
        onChangeText={(text) => {
          clearError("userName");
          setUserName(text);
        }}
        error={errors.userName}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="username"
        autoComplete="username"
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
        onChangeText={setPassword}
        footer={<PasswordRequirements value={password} />}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        autoComplete="password"
        returnKeyType="go"
        onSubmitEditing={onSignupPress}
      />

      <Pressable
        style={[styles.button, isSignupPending && styles.buttonDisabled]}
        disabled={isSignupPending}
        onPress={onSignupPress}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>

      {signUpError?.message ? (
        <Text style={styles.formError}>{signUpError.message}</Text>
      ) : null}

      <View style={styles.signupSection}>
        <Text style={styles.signupText}>Already have an account?</Text>
        <Link style={styles.signupLink} href={"/(auth)/login"}>
          Log in
        </Link>
      </View>
    </AuthScreen>
  );
};

export default Signup;
