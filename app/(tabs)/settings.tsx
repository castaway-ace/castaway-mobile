import { useAuth } from "@/contexts/auth-context";
import { Button, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Settings = () => {
  const { logout } = useAuth();
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Settings</Text>
      <Button title="Logout" onPress={logout} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Settings;
