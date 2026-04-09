import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function FeedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>For You</Text>
      {/* TODO: Vertical video feed with swipe navigation */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});
