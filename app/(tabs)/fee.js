import { View, Text, StyleSheet } from "react-native";

export default function FeeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Fee Management</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});