import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colorsByType } from "../constants/colors";
import { Pokemon } from "../hooks/usePokemon";
import TypeBadge from "./TypeBadge";

interface Props {
  item: Pokemon;
  isDark: boolean;
  theme: any;
  onPress: (pokemon: Pokemon) => void;
}

export default function PokemonCard({ item, isDark, theme, onPress }: Props) {
  const mainColor   = colorsByType[item.types[0].type.name];
  const formattedId = `#${String(item.id).padStart(3, "0")}`;

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? mainColor + "22" : mainColor + "33",
          borderLeftColor: mainColor,
          borderTopColor: mainColor + "88",
          borderTopWidth: isDark ? 0.5 : 0,
          borderRightWidth: isDark ? 0.5 : 0,
          borderRightColor: theme.border,
          borderBottomWidth: isDark ? 0.5 : 0,
          borderBottomColor: theme.border,
        },
      ]}
      activeOpacity={0.75}
    >
      <View style={styles.nameRow}>
        <Text style={[styles.id, { color: theme.subtext }]}>{formattedId}</Text>
        <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
      </View>

      <View style={styles.typesRow}>
        {item.types.map((t) => (
          <TypeBadge key={t.type.name} type={t.type.name} />
        ))}
      </View>

      <View style={styles.imagesRow}>
        <Image source={{ uri: item.image }}     style={styles.image} />
        <Image source={{ uri: item.imageBack }} style={styles.image} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16, borderRadius: 20, borderLeftWidth: 5,
  },
  nameRow: {
    flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 6,
  },
  id:   { fontSize: 14, fontWeight: "bold" },
  name: { fontSize: 24, fontWeight: "bold", textTransform: "capitalize" },
  typesRow:  { flexDirection: "row", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  imagesRow: { flexDirection: "row" },
  image:     { width: 130, height: 130 },
});