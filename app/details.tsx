import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import EvolutionChain from "../src/components/EvolutionChain";
import LangToggle from "../src/components/LangToggle";
import StatBar from "../src/components/StatBar";
import TypeBadge from "../src/components/TypeBadge";
import { colorsByType, getTheme } from "../src/constants/colors";
import { typeMatchups } from "../src/constants/typeMatchups";
import { generateBattleStory, generatePokemonBio } from "../src/services/claudeApi";
import { fetchPokemonDetail, PokemonDetail } from "../src/services/pokeApi";


export default function Details() {
  const params      = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark      = colorScheme === "dark";
  const theme       = getTheme(isDark);

  const [pokemon,       setPokemon]       = useState<PokemonDetail | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [bio,           setBio]           = useState<{ en: string; hi: string } | null>(null);
  const [bioLoading,    setBioLoading]    = useState(false);
  const [battleStory,   setBattleStory]   = useState<{ story_en: string; story_hi: string } | null>(null);
  const [battleLoading, setBattleLoading] = useState(false);
  const [lang,          setLang]          = useState<"en" | "hi">("en");

  useEffect(() => {
    const name = Array.isArray(params.name) ? params.name[0] : params.name as string;
    if (name) loadPokemon(name);
  }, [params.name]);

  async function loadPokemon(name: string) {
    setLoading(true);
    try {
      // Service se fetch — code repeat nahi
      const data = await fetchPokemonDetail(name);
      setPokemon(data);

      // Bio + Battle parallel — dono ek saath
      const types   = data.types.map((t) => t.type.name).join(" and ");
      const topStat = [...data.stats].sort((a, b) => b.base_stat - a.base_stat)[0];

      setBioLoading(true);
      setBattleLoading(true);

      generatePokemonBio(
        data.name, types,
        topStat.stat.name, topStat.base_stat,
        data.height / 10, data.weight / 10
      )
        .then(setBio)
        .catch(() => setBio({
          en: `${data.name} is a powerful ${data.types[0].type.name}-type Pokemon.`,
          hi: `${data.name} एक शक्तिशाली Pokemon है।`,
        }))
        .finally(() => setBioLoading(false));

      generateBattleStory(data.name, types, topStat.stat.name, topStat.base_stat)
        .then(setBattleStory)
        .catch(() => setBattleStory({
          story_en: `${data.name} dominates with ${data.types[0].type.name} moves!`,
          story_hi: `${data.name} अपने हमलों से दुश्मनों को हराता है!`,
        }))
        .finally(() => setBattleLoading(false));

    } catch (e) {
      console.log("Details error:", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Loading..." }} />
        <View style={[styles.center, { backgroundColor: theme.bg }]}>
          <ActivityIndicator size="large" color="#EE8130" />
        </View>
      </>
    );
  }

  if (!pokemon) {
    return (
      <>
        <Stack.Screen options={{ title: "Error" }} />
        <View style={[styles.center, { backgroundColor: theme.bg }]}>
          <Text style={{ color: theme.text }}>Kuch gadbad ho gayi!</Text>
        </View>
      </>
    );
  }

  const mainColor   = colorsByType[pokemon.types[0].type.name] || "#888";
  const capitalName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const formattedId = `#${String(pokemon.id).padStart(3, "0")}`;
  const matchup     = typeMatchups[pokemon.types[0].type.name];

  return (
    <>
      <Stack.Screen options={{ title: `${formattedId} ${capitalName}` }} />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: isDark ? "#1a1a1a" : mainColor + "22" },
        ]}
      >
        {/* Images */}
        <View style={styles.imagesRow}>
          <Image source={{ uri: pokemon.image }}     style={styles.image} />
          <Image source={{ uri: pokemon.imageBack }} style={styles.image} />
        </View>

        {/* ID + Name */}
        <Text style={[styles.pokemonId, { color: theme.subtext }]}>{formattedId}</Text>
        <Text style={[styles.name,      { color: theme.text    }]}>{capitalName}</Text>

        {/* Type Badges — reusable component */}
        <View style={styles.typesRow}>
          {pokemon.types.map((t) => (
            <TypeBadge key={t.type.name} type={t.type.name} />
          ))}
        </View>

        {/* Height Weight XP */}
        <View style={[styles.infoRow, { backgroundColor: theme.card }]}>
          <View style={styles.infoCard}>
            <Text style={[styles.infoValue, { color: theme.text    }]}>{(pokemon.height / 10).toFixed(1)}m</Text>
            <Text style={[styles.infoLabel, { color: theme.subtext }]}>Height</Text>
          </View>
          <View style={[styles.infoCard, styles.infoMid, { borderColor: theme.border }]}>
            <Text style={[styles.infoValue, { color: theme.text    }]}>{(pokemon.weight / 10).toFixed(1)}kg</Text>
            <Text style={[styles.infoLabel, { color: theme.subtext }]}>Weight</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={[styles.infoValue, { color: theme.text    }]}>{pokemon.base_experience}</Text>
            <Text style={[styles.infoLabel, { color: theme.subtext }]}>Base XP</Text>
          </View>
        </View>

        {/* About */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
            <LangToggle lang={lang} setLang={setLang} mainColor={mainColor} theme={theme} />
          </View>
          {bioLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={mainColor} />
              <Text style={[styles.loadingText, { color: theme.subtext }]}>Bio generate ho rahi hai...</Text>
            </View>
          ) : (
            <Text style={[styles.bodyText, { color: theme.subtext }]}>
              {bio ? bio[lang] : ""}
            </Text>
          )}
        </View>

        {/* Evolution Chain — naya component */}
        <EvolutionChain
          pokemonName={pokemon.name}
          mainColor={mainColor}
          theme={theme}
        />

        {/* Type Matchups */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Type Matchups</Text>
          <Text style={[styles.matchupLabel, { color: "#4CAF50" }]}>Strong against</Text>
          <View style={styles.typesRow}>
            {matchup?.strong.length > 0 ? (
              matchup.strong.map((t) => <TypeBadge key={t} type={t} />)
            ) : (
              <Text style={{ color: theme.subtext, fontSize: 13 }}>Kisi pe extra effective nahi</Text>
            )}
          </View>
          <Text style={[styles.matchupLabel, { color: "#F44336", marginTop: 12 }]}>Weak against</Text>
          <View style={styles.typesRow}>
            {matchup?.weak.map((t) => <TypeBadge key={t} type={t} />)}
          </View>
        </View>

        {/* Battle Story */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Battle Story</Text>
            <LangToggle lang={lang} setLang={setLang} mainColor={mainColor} theme={theme} />
          </View>
          {battleLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={mainColor} />
              <Text style={[styles.loadingText, { color: theme.subtext }]}>Battle story aa rahi hai...</Text>
            </View>
          ) : (
            <Text style={[styles.bodyText, { color: theme.subtext }]}>
              {battleStory ? (lang === "en" ? battleStory.story_en : battleStory.story_hi) : ""}
            </Text>
          )}
        </View>

        {/* Base Stats — reusable component */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Base Stats</Text>
          {pokemon.stats.map((s) => (
            <StatBar
              key={s.stat.name}
              name={s.stat.name}
              value={s.base_stat}
              color={mainColor}
            />
          ))}
        </View>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  center:      { flex: 1, justifyContent: "center", alignItems: "center" },
  container:   { padding: 16, gap: 12, paddingBottom: 40 },
  imagesRow:   { flexDirection: "row", justifyContent: "center" },
  image:       { width: 150, height: 150 },
  pokemonId:   { fontSize: 15, fontWeight: "bold", textAlign: "center" },
  name: {
    fontSize: 28, fontWeight: "bold",
    textAlign: "center", textTransform: "capitalize", marginBottom: 4,
  },
  typesRow:    { flexDirection: "row", justifyContent: "center", gap: 8, flexWrap: "wrap" },
  infoRow:     { flexDirection: "row", justifyContent: "space-around", borderRadius: 16, padding: 16 },
  infoCard:    { alignItems: "center", flex: 1 },
  infoMid:     { borderLeftWidth: 0.5, borderRightWidth: 0.5 },
  infoValue:   { fontSize: 18, fontWeight: "bold" },
  infoLabel:   { fontSize: 12, marginTop: 4 },
  card:        { borderRadius: 16, padding: 16, gap: 8 },
  cardHeader:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 17, fontWeight: "bold" },
  matchupLabel: { fontSize: 13, fontWeight: "bold" },
  bodyText:    { fontSize: 14, lineHeight: 22 },
  loadingRow:  { flexDirection: "row", alignItems: "center", gap: 8 },
  loadingText: { fontSize: 13 },
});
