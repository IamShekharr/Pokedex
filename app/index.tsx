import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import PokemonCard from "../src/components/PokemonCard";
import SkeletonCard from "../src/components/SkeletonCard";
import { colorsByType, getTheme } from "../src/constants/colors";
import { useFavorites } from "../src/hooks/useFavorites";
import { Pokemon, usePokemonList } from "../src/hooks/usePokemon";
import { callClaude } from "../src/services/claudeApi";
import { getPokemonCryUrl } from "../src/services/pokeApi";

const filterTypes = [
  "all", "fire", "water", "grass", "electric",
  "psychic", "dragon", "poison", "bug", "rock",
];

interface BattleData {
  winner: string;
  story_en: string;
  p1_stats: { hp: number; attack: number; defense: number; speed: number };
  p2_stats: { hp: number; attack: number; defense: number; speed: number };
}

export default function Index() {
  const router      = useRouter();
  const colorScheme = useColorScheme();
  const isDark      = colorScheme === "dark";
  const theme       = getTheme(isDark);

  const { pokemons, loading, loadingMore, hasMore, loadMore } = usePokemonList();
  const { toggleFavorite } = useFavorites();

  const [search, setSearch]                       = useState("");
  const [activeFilter, setActiveFilter]           = useState("all");
  const [filterIndex, setFilterIndex]             = useState(0);
  const [isSwipingHorizontal, setIsSwipingHorizontal] = useState(false);

  // Spotlight
  const [spotlightPokemon, setSpotlightPokemon]   = useState<Pokemon | null>(null);
  const scaleAnim   = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Battle
  const [battleMode, setBattleMode]               = useState(false);
  const [selectedForBattle, setSelectedForBattle] = useState<Pokemon[]>([]);
  const [battleData, setBattleData]               = useState<BattleData | null>(null);
  const [battleLoading, setBattleLoading]         = useState(false);
  const [showBattleModal, setShowBattleModal]     = useState(false);

  // ─── Swipe Gesture ────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,

      onMoveShouldSetPanResponder: (_, g) => {
        // ✅ Sirf tab swipe detect karo jab horizontal movement zyada ho
        const isHorizontal =
          Math.abs(g.dx) > 15 &&
          Math.abs(g.dx) > Math.abs(g.dy) * 3;
        if (isHorizontal) setIsSwipingHorizontal(true);
        return isHorizontal;
      },

      onPanResponderTerminationRequest: () => false,

      onPanResponderRelease: (_, g) => {
        setIsSwipingHorizontal(false);
        if (g.dx < -60) {
          // Left swipe → agla type
          setFilterIndex((prev) => {
            const next = Math.min(prev + 1, filterTypes.length - 1);
            setActiveFilter(filterTypes[next]);
            return next;
          });
        } else if (g.dx > 60) {
          // Right swipe → pichla type
          setFilterIndex((prev) => {
            const prevIdx = Math.max(prev - 1, 0);
            setActiveFilter(filterTypes[prevIdx]);
            return prevIdx;
          });
        }
      },

      onPanResponderTerminate: () => {
        setIsSwipingHorizontal(false);
      },
    })
  ).current;

  // ─── Filter + Search ──────────────────────────────
  const filteredPokemons = pokemons.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === "all"
        ? true
        : p.types.some((t) => t.type.name === activeFilter);
    return matchesSearch && matchesFilter;
  });

  // ─── Sound ────────────────────────────────────────
  async function playPokemonCry(id: number) {
    try {
      const { sound } = await Audio.Sound.createAsync({
        uri: getPokemonCryUrl(id),
      });
      await sound.playAsync();
    } catch (e) {
      console.log("Sound error:", e);
    }
  }

  // ─── Pokemon Press ────────────────────────────────
  function handlePokemonPress(pokemon: Pokemon) {
    if (battleMode) {
      handleBattleSelect(pokemon);
      return;
    }

    playPokemonCry(pokemon.id);
    setSpotlightPokemon(pokemon);
    scaleAnim.setValue(0.3);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1, friction: 5, tension: 80, useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setSpotlightPokemon(null);
      setTimeout(() => {
        router.push({
          pathname: "/details",
          params: { name: pokemon.name },
        });
      }, 100);
    }, 1500);
  }

  // ─── Battle ───────────────────────────────────────
  function handleBattleSelect(pokemon: Pokemon) {
    if (selectedForBattle.find((p) => p.name === pokemon.name)) {
      setSelectedForBattle((prev) =>
        prev.filter((p) => p.name !== pokemon.name)
      );
      return;
    }
    if (selectedForBattle.length >= 2) return;
    setSelectedForBattle((prev) => [...prev, pokemon]);
  }

  async function startBattle() {
    if (selectedForBattle.length !== 2) return;
    setBattleLoading(true);
    setShowBattleModal(true);

    const [p1, p2] = selectedForBattle;
    const p1Types  = p1.types.map((t) => t.type.name).join(", ");
    const p2Types  = p2.types.map((t) => t.type.name).join(", ");

    try {
      const result = await callClaude(
        `Two Pokemon are battling:
Pokemon 1: ${p1.name} — Type: ${p1Types}
Pokemon 2: ${p2.name} — Type: ${p2Types}

Based on their types, decide the winner and create realistic battle stats.
Respond ONLY with JSON, no backticks:
{
  "winner": "${p1.name} or ${p2.name}",
  "story_en": "dramatic 30-word english battle story explaining why winner won",
  "p1_stats": { "hp": 0-100, "attack": 0-100, "defense": 0-100, "speed": 0-100 },
  "p2_stats": { "hp": 0-100, "attack": 0-100, "defense": 0-100, "speed": 0-100 }
}`
      );

      const parsed = JSON.parse(result.replace(/```json|```/g, "").trim());
      setBattleData(parsed);
    } catch (e) {
      setBattleData({
        winner: p1.name,
        story_en: `${p1.name} wins the battle against ${p2.name} with superior type advantage!`,
        p1_stats: { hp: 80, attack: 75, defense: 70, speed: 85 },
        p2_stats: { hp: 70, attack: 65, defense: 60, speed: 75 },
      });
    } finally {
      setBattleLoading(false);
    }
  }

  function resetBattle() {
    setBattleMode(false);
    setSelectedForBattle([]);
    setBattleData(null);
    setShowBattleModal(false);
  }

  // ─── Loading ──────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>

      {/* ✅ Swipe gesture wrapper */}
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        <FlatList
          data={filteredPokemons}
          keyExtractor={(item) => item.name}

          // ✅ Jab horizontal swipe ho tab vertical scroll band karo
          scrollEnabled={!isSwipingHorizontal}

          renderItem={({ item }) => {
            const isSelected = !!selectedForBattle.find(
              (p) => p.name === item.name
            );
            return (
              <View>
                <PokemonCard
                  item={item}
                  isDark={isDark}
                  theme={theme}
                  onPress={handlePokemonPress}
                />
                {battleMode && isSelected && (
                  <View style={styles.selectedOverlay}>
                    <Text style={styles.selectedText}>⚔️ Selected</Text>
                  </View>
                )}
              </View>
            );
          }}

          ListHeaderComponent={
            <View>
              {/* Search bar */}
              <TextInput
                style={[
                  styles.searchBar,
                  {
                    backgroundColor: theme.input,
                    color: theme.inputText,
                  },
                ]}
                placeholder="Search Pokemon..."
                placeholderTextColor={theme.inputPlaceholder}
                value={search}
                onChangeText={setSearch}
              />

              {/* Type filter tabs */}
              <FlatList
                horizontal
                data={filterTypes}
                keyExtractor={(t) => t}
                showsHorizontalScrollIndicator={false}
                style={styles.filterList}
                renderItem={({ item: type }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setActiveFilter(type);
                      setFilterIndex(filterTypes.indexOf(type));
                    }}
                    style={[
                      styles.filterTab,
                      {
                        backgroundColor:
                          activeFilter === type
                            ? colorsByType[type] || "#EE8130"
                            : theme.input,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        {
                          color:
                            activeFilter === type
                              ? "white"
                              : theme.subtext,
                        },
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                )}
              />

              {/* Battle mode button */}
              <TouchableOpacity
                onPress={() => {
                  setBattleMode(!battleMode);
                  setSelectedForBattle([]);
                }}
                style={[
                  styles.battleBtn,
                  {
                    backgroundColor: battleMode
                      ? "#C22E28"
                      : theme.input,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.battleBtnText,
                    { color: battleMode ? "white" : theme.text },
                  ]}
                >
                  {battleMode
                    ? "⚔️ Battle Mode ON — Select 2 Pokemon"
                    : "⚔️ Battle Mode"}
                </Text>
              </TouchableOpacity>

              {/* Battle start button */}
              {selectedForBattle.length === 2 && (
                <TouchableOpacity
                  onPress={startBattle}
                  style={styles.startBattleBtn}
                >
                  <Text style={styles.startBattleBtnText}>
                    ⚔️{" "}
                    {selectedForBattle[0].name.charAt(0).toUpperCase() +
                      selectedForBattle[0].name.slice(1)}{" "}
                    VS{" "}
                    {selectedForBattle[1].name.charAt(0).toUpperCase() +
                      selectedForBattle[1].name.slice(1)}{" "}
                    — BATTLE!
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }

          contentContainerStyle={{
            gap: 16,
            padding: 16,
            paddingBottom: 32,
          }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}

          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#EE8130" />
                <Text style={[styles.footerText, { color: theme.subtext }]}>
                  Loading more Pokemon...
                </Text>
              </View>
            ) : !hasMore && pokemons.length > 0 ? (
              <Text style={[styles.endText, { color: theme.subtext }]}>
                — All Pokemon loaded! —
              </Text>
            ) : null
          }

          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.subtext }]}>
              No Pokemon found
            </Text>
          }
        />
      </View>

      {/* ── Spotlight Modal ── */}
      <Modal
        visible={spotlightPokemon !== null}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <View style={styles.spotlightOverlay}>
          {spotlightPokemon && (
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
                alignItems: "center",
              }}
            >
              <View
                style={[
                  styles.spotlightCircle,
                  {
                    backgroundColor:
                      colorsByType[spotlightPokemon.types[0].type.name] +
                      "44",
                  },
                ]}
              />
              <Image
                source={{ uri: spotlightPokemon.image }}
                style={styles.spotlightImage}
              />
              <Text style={styles.spotlightId}>
                #{String(spotlightPokemon.id).padStart(3, "0")}
              </Text>
              <Text style={styles.spotlightName}>
                {spotlightPokemon.name}
              </Text>
            </Animated.View>
          )}
        </View>
      </Modal>

      {/* ── Battle Modal ── */}
      <Modal
        visible={showBattleModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.battleOverlay}>
          <View style={[styles.battleCard, { backgroundColor: theme.card }]}>

            {battleLoading ? (
              <View style={styles.battleLoading}>
                <ActivityIndicator size="large" color="#EE8130" />
                <Text style={[styles.battleLoadingText, { color: theme.text }]}>
                  Battle in progress...
                </Text>
              </View>

            ) : battleData ? (
              <>
                {/* VS Images */}
                <View style={styles.vsRow}>
                  <View style={styles.vsPlayer}>
                    <Image
                      source={{ uri: selectedForBattle[0]?.image }}
                      style={[
                        styles.vsImage,
                        battleData.winner === selectedForBattle[0]?.name &&
                          styles.winnerImage,
                      ]}
                    />
                    <Text style={[styles.vsName, { color: theme.text }]}>
                      {selectedForBattle[0]?.name}
                    </Text>
                    {battleData.winner === selectedForBattle[0]?.name && (
                      <Text style={styles.winnerCrown}>🏆</Text>
                    )}
                  </View>

                  <Text style={styles.vsText}>VS</Text>

                  <View style={styles.vsPlayer}>
                    <Image
                      source={{ uri: selectedForBattle[1]?.image }}
                      style={[
                        styles.vsImage,
                        battleData.winner === selectedForBattle[1]?.name &&
                          styles.winnerImage,
                      ]}
                    />
                    <Text style={[styles.vsName, { color: theme.text }]}>
                      {selectedForBattle[1]?.name}
                    </Text>
                    {battleData.winner === selectedForBattle[1]?.name && (
                      <Text style={styles.winnerCrown}>🏆</Text>
                    )}
                  </View>
                </View>

                {/* ✅ Stat Comparison */}
                <View style={[styles.statsCard, { backgroundColor: theme.bg }]}>
                  <Text style={[styles.statsTitle, { color: theme.text }]}>
                    Battle Stats
                  </Text>

                  {(
                    ["hp", "attack", "defense", "speed"] as const
                  ).map((stat) => {
                    const v1     = battleData.p1_stats[stat];
                    const v2     = battleData.p2_stats[stat];
                    const p1Wins = v1 >= v2;

                    return (
                      <View key={stat} style={styles.statCompRow}>
                        {/* P1 bar — right se left */}
                        <View style={styles.statBarLeft}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                width: `${v1}%` as any,
                                backgroundColor: p1Wins
                                  ? "#4CAF50"
                                  : "#666",
                              },
                            ]}
                          />
                        </View>

                        {/* Stat name */}
                        <Text
                          style={[
                            styles.statLabel,
                            { color: theme.subtext },
                          ]}
                        >
                          {stat.toUpperCase()}
                        </Text>

                        {/* P2 bar — left se right */}
                        <View style={styles.statBarRight}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                width: `${v2}%` as any,
                                backgroundColor: !p1Wins
                                  ? "#4CAF50"
                                  : "#666",
                              },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}

                  {/* Player names */}
                  <View style={styles.statNamesRow}>
                    <Text
                      style={[styles.statPlayerName, { color: theme.text }]}
                    >
                      {selectedForBattle[0]?.name}
                    </Text>
                    <Text
                      style={[styles.statPlayerName, { color: theme.text }]}
                    >
                      {selectedForBattle[1]?.name}
                    </Text>
                  </View>
                </View>

                {/* Battle Story */}
                <Text style={[styles.battleStory, { color: theme.subtext }]}>
                  {battleData.story_en}
                </Text>

                {/* Close */}
                <TouchableOpacity
                  onPress={resetBattle}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeBtnText}>
                    Battle End — Back to List
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:  { flex: 1 },
  searchBar: {
    borderRadius: 12, padding: 12,
    fontSize: 16, marginBottom: 8,
  },
  filterList: { marginBottom: 8 },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, marginRight: 8,
  },
  filterTabText: {
    fontSize: 13, fontWeight: "bold", textTransform: "capitalize",
  },
  battleBtn: {
    padding: 12, borderRadius: 12,
    marginBottom: 8, alignItems: "center",
  },
  battleBtnText:      { fontSize: 14, fontWeight: "bold" },
  startBattleBtn: {
    backgroundColor: "#C22E28",
    padding: 14, borderRadius: 12,
    marginBottom: 8, alignItems: "center",
  },
  startBattleBtnText: {
    color: "white", fontSize: 14,
    fontWeight: "bold", textTransform: "capitalize",
  },
  selectedOverlay: {
    position: "absolute", top: 8, right: 8,
    backgroundColor: "#C22E28",
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10,
  },
  selectedText:  { color: "white", fontSize: 12, fontWeight: "bold" },
  footerLoader:  { alignItems: "center", paddingVertical: 16, gap: 8 },
  footerText:    { fontSize: 13 },
  endText:       { textAlign: "center", fontSize: 13, paddingVertical: 20 },
  emptyText:     { textAlign: "center", fontSize: 16, marginTop: 40 },

  // Spotlight
  spotlightOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.88)",
    justifyContent: "center", alignItems: "center",
  },
  spotlightCircle: {
    position: "absolute", width: 240, height: 240, borderRadius: 120,
  },
  spotlightImage: { width: 200, height: 200 },
  spotlightId: {
    color: "#aaaaaa", fontSize: 16,
    fontWeight: "bold", marginTop: 8,
  },
  spotlightName: {
    color: "white", fontSize: 28,
    fontWeight: "bold", textTransform: "capitalize",
  },

  // Battle Modal
  battleOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.88)",
    justifyContent: "center", alignItems: "center", padding: 20,
  },
  battleCard: {
    width: "100%", borderRadius: 20,
    padding: 20, gap: 16,
  },
  battleLoading:     { alignItems: "center", gap: 12, padding: 20 },
  battleLoadingText: { fontSize: 16, fontWeight: "bold" },

  // VS
  vsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  vsPlayer:    { alignItems: "center", gap: 4 },
  vsImage:     { width: 100, height: 100, opacity: 0.5 },
  winnerImage: { opacity: 1, transform: [{ scale: 1.15 }] },
  vsName: {
    fontSize: 13, fontWeight: "bold", textTransform: "capitalize",
  },
  winnerCrown: { fontSize: 22 },
  vsText:      { fontSize: 28, fontWeight: "bold", color: "#EE8130" },

  // Stats comparison
  statsCard:   { borderRadius: 12, padding: 12, gap: 8 },
  statsTitle:  { fontSize: 14, fontWeight: "bold", textAlign: "center", marginBottom: 4 },
  statCompRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statBarLeft: {
    flex: 1, height: 8,
    backgroundColor: "#333",
    borderRadius: 4, overflow: "hidden",
    flexDirection: "row", justifyContent: "flex-end", // ✅ right se left
  },
  statBarRight: {
    flex: 1, height: 8,
    backgroundColor: "#333",
    borderRadius: 4, overflow: "hidden",
  },
  barFill:      { height: 8, borderRadius: 4 },
  statLabel: {
    fontSize: 10, fontWeight: "bold",
    width: 64, textAlign: "center",
  },
  statNamesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  statPlayerName: {
    fontSize: 11, fontWeight: "bold", textTransform: "capitalize",
  },

  battleStory: {
    fontSize: 13, lineHeight: 20, textAlign: "center",
  },
  closeBtn: {
    backgroundColor: "#EE8130",
    padding: 14, borderRadius: 12, alignItems: "center",
  },
  closeBtnText: { color: "white", fontSize: 14, fontWeight: "bold" },
});