import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  lang: "en" | "hi";
  setLang: (l: "en" | "hi") => void;
  mainColor: string;
  theme: any;
}

export default function LangToggle({ lang, setLang, mainColor, theme }: Props) {
  return (
    <View style={styles.row}>
      {(["en", "hi"] as const).map((l) => (
        <TouchableOpacity
          key={l}
          onPress={() => setLang(l)}
          style={[
            styles.btn,
            { borderColor: theme.border },
            lang === l && { backgroundColor: mainColor },
          ]}
        >
          <Text
            style={[
              styles.text,
              { color: theme.text },
              lang === l && { color: "white" },
            ]}
          >
            {l.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  btn: {
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 10, borderWidth: 0.5,
  },
  text: { fontSize: 12, fontWeight: "bold" },
});