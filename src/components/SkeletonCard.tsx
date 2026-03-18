// ✅ Kab use karte hain?
// Data load hone mein time lage → Skeleton dikhao
// Better UX than spinner!

import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ✅ Loop animation — baar baar chalti rahe
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1, duration: 800, useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0, duration: 800, useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.titleRow}>
        <View style={styles.id} />
        <View style={styles.title} />
      </View>
      <View style={styles.badge} />
      <View style={styles.images} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#242424",
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  titleRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  id:     { width: 40, height: 16, backgroundColor: "#333", borderRadius: 8 },
  title:  { width: 120, height: 24, backgroundColor: "#333", borderRadius: 8 },
  badge:  { width: 70, height: 28, backgroundColor: "#333", borderRadius: 20 },
  images: { width: "100%", height: 130, backgroundColor: "#333", borderRadius: 12 },
});