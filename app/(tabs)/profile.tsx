import { StyleSheet, Text, View } from "react-native";

const Profile = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Profile</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filterSection: {
    display: "flex",
    padding: 16,
  },
  filterSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Profile;
