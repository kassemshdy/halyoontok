import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface VideoPlayerProps {
  videoUrl: string;
}

export function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  // TODO: Integrate expo-av Video component for HLS playback
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: "#000",
  },
});
