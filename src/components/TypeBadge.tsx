import { StyleSheet, Text, View } from "react-native";
import { colorsByType } from "../constants/colors";

interface Props {
  type: string;
  size?: "sm" | "md";  // ✅ size prop — reusable!
}

export default function TypeBadge({ type, size = "md" }: Props) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colorsByType[type] || "#888" },
        size === "sm" && styles.badgeSm,
      ]}
    >
      <Text
        style={[styles.text, size === "sm" && styles.textSm]}
      >
        {type}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20,
  },
  badgeSm: {
    paddingHorizontal: 10, paddingVertical: 3,
  },
  text: {
    color: "white", fontWeight: "bold",
    textTransform: "capitalize", fontSize: 12,
  },
  textSm: { fontSize: 10 },
});