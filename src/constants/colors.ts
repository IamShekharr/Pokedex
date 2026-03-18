// ✅ Kab use karte hain?
// Jab colors multiple files mein same use ho rahe hain
// Ek jagah change karo — sab jagah update ho jaayega

export const colorsByType: Record<string, string> = {
  normal: "#A8A77A", fire: "#EE8130", water: "#6390F0",
  electric: "#F7D02C", grass: "#7AC74C", ice: "#96D9D6",
  fighting: "#C22E28", poison: "#A33EA1", ground: "#E2BF65",
  flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
  rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC",
  dark: "#705746", steel: "#B7B7CE", fairy: "#D685AD",
};

export const statColors: Record<string, string> = {
  hp: "#FF5959",
  attack: "#F5AC78",
  defense: "#FAE078",
  "special-attack": "#9DB7F5",
  "special-defense": "#A7DB8D",
  speed: "#FA92B2",
};

export const getTheme = (isDark: boolean) => ({
  bg:      isDark ? "#1a1a1a" : "#f5f5f5",
  card:    isDark ? "#242424" : "#ffffff",
  text:    isDark ? "#ffffff" : "#000000",
  subtext: isDark ? "#aaaaaa" : "#666666",
  input:   isDark ? "#2e2e2e" : "#efefef",
  inputText:         isDark ? "#ffffff" : "#000000",
  inputPlaceholder:  isDark ? "#777777" : "#aaaaaa",
  border:  isDark ? "#333333" : "#e0e0e0",
});