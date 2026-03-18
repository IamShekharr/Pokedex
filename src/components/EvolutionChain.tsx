import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { EvolutionStage, fetchEvolutionChain } from "../services/pokeApi";

interface Props {
  pokemonName: string;
  mainColor: string;
  theme: any;
}

export default function EvolutionChain({ pokemonName, mainColor, theme }: Props) {
  const [chain, setChain]     = useState<EvolutionStage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChain();
  }, [pokemonName]);

  async function loadChain() {
    setLoading(true);
    try {
      const data = await fetchEvolutionChain(pokemonName);
      setChain(data);
    } catch (e) {
      console.log("Evolution error:", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          Evolution Chain
        </Text>
        <ActivityIndicator size="small" color={mainColor} />
      </View>
    );
  }

  // Sirf ek stage hai — evolution nahi hoti
  if (chain.length <= 1) return null;

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Evolution Chain
      </Text>

      <View style={styles.chain}>
        {chain.map((stage, index) => (
          <View key={stage.name} style={styles.stageRow}>

            {/* Arrow — pehle stage pe nahi dikhega */}
            {index > 0 && (
              <Text style={[styles.arrow, { color: theme.subtext }]}>
                →
              </Text>
            )}

            <View style={styles.stage}>
              <Image
                source={{ uri: stage.image }}
                style={styles.image}
              />
              <Text style={[styles.name, { color: theme.text }]}>
                {stage.name}
              </Text>
              <Text style={[styles.id, { color: theme.subtext }]}>
                #{String(stage.id).padStart(3, "0")}
              </Text>
            </View>

          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
  },
  chain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stage: {
    alignItems: "center",
    gap: 4,
  },
  image: {
    width: 80,
    height: 80,
  },
  name: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  id: {
    fontSize: 11,
  },
  arrow: {
    fontSize: 20,
    marginHorizontal: 8,
  },
});