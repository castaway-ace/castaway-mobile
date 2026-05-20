import { Link } from "expo-router";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { makeStyles } from "../../components/auth/login";
import { useTheme } from "../../contexts/theme-context";

const Signup = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text>Sign up Page</Text>
      <View>
        <Text>Already have an account?</Text>
        <Link href={"/(auth)/login"}>Log in</Link>
      </View>
    </SafeAreaView>
  );
};

export default Signup;
