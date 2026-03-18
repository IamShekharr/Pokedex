import { StyleSheet, Text, View } from "react-native";
import { statColors } from "../constants/colors";

interface Props {
  name: string;
  value: number;
  color?: string;
}

export default function StatBar({ name, value, color }: Props) {
  const barColor = statColors[name] || color || "#888";

// ✅ Fix — as const lagao
const width = `${Math.round((value / 255) * 100)}%` as `${number}%`;


  return (
    <View style={styles.row}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row:    { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  name:   { fontSize: 12, color: "#aaa", width: 110, textTransform: "capitalize" },
  value:  { fontSize: 13, fontWeight: "bold", color: "#fff", width: 30, textAlign: "right" },
  barBg:  { flex: 1, height: 8, backgroundColor: "#333", borderRadius: 4, overflow: "hidden" },
  barFill:{ height: 8, borderRadius: 4 },
});